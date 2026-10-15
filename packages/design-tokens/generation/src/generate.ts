#!/usr/bin/env node
import {mkdir, readdir, readFile, rename, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';

import Ajv from 'ajv';

import {
  cloneJson,
  FORMAT_SCHEMA,
  GENERATED_DESCRIPTION,
  GENERATION_EXTENSION_KEY,
  isJsonObject,
  isToken,
  parseJson,
  stampGeneratedTokens,
} from './dtcg';
import {generateBorderWidthTokens} from './generators/borderWidth';
import {generateBreakpointTokens} from './generators/breakpoint';
import {generateColorTokens} from './generators/color';
import {generateDimensionTokens} from './generators/dimension';
import {generateLayerTokens} from './generators/layer';
import {generateOpacityTokens} from './generators/opacity';
import {generateRadiusTokens} from './generators/radius';
import {generateTypographyTokens} from './generators/typography';
import type {
  BorderWidthRecipe,
  BreakpointRecipe,
  ColorRecipe,
  DimensionRecipe,
  GeneratedTokenPatch,
  GenerationConfig,
  GenerationMarker,
  GeneratorName,
  JsonObject,
  JsonValue,
  LayerRecipe,
  OpacityRecipe,
  RadiusRecipe,
  TypographyRecipe,
} from './types';

const ROOT_DIRECTORY = path.resolve(__dirname, '../..');
const GENERATION_DIRECTORY = path.join(ROOT_DIRECTORY, 'generation');
const GENERATION_CONFIG_PATH = path.join(GENERATION_DIRECTORY, 'config.json');
const RECIPES_DIRECTORY = path.join(GENERATION_DIRECTORY, 'recipes');
const TOKENS_DIRECTORY = path.join(ROOT_DIRECTORY, 'tokens');
const SCHEMAS_DIRECTORY = path.join(GENERATION_DIRECTORY, 'schemas');
const GENERATION_CONFIG_SCHEMA_PATH = path.join(SCHEMAS_DIRECTORY, 'config.schema.json');
const CHECK_MODE = process.argv.includes('--check');
const JSON_INDENT = 2;

type RecipeDocument =
  | BorderWidthRecipe
  | BreakpointRecipe
  | ColorRecipe
  | DimensionRecipe
  | OpacityRecipe
  | RadiusRecipe
  | TypographyRecipe;

interface LoadedRecipe {
  relativePath: string;
  source: string;
  generator: GeneratorName;
  recipe: RecipeDocument;
}

interface PlannedPatch {
  filePath: string;
  source: string;
  patch: GeneratedTokenPatch;
  leafPaths: string[][];
}

interface FileUpdate {
  filePath: string;
  content: string;
}

interface ValidationContext {
  configValidator: ReturnType<Ajv['compile']>;
  recipeValidators: Map<GeneratorName, ReturnType<Ajv['compile']>>;
}

/**
 * Generates all recipe-backed token files, or checks whether they are up to date.
 */
async function main(): Promise<void> {
  const validation = await loadValidators();
  const config = await loadConfig(validation);
  const recipes = await loadRecipes(validation);
  const plannedPatches = planPatches(recipes, config);
  const filePlans = groupPatchesByFile(plannedPatches);
  const existingTokenFiles = await findTokenFiles(TOKENS_DIRECTORY);
  const filesToReconcile = [...new Set([...filePlans.keys(), ...existingTokenFiles])].sort();
  const updates: FileUpdate[] = [];

  for (const filePath of filesToReconcile) {
    const plans = filePlans.get(filePath) ?? [];
    if (plans.length === 0) {
      const existing = await readJsonIfExists(filePath);
      if (existing === null || collectGeneratedTokenPaths(existing, []).length === 0) {
        continue;
      }
    }

    const nextDocument = await buildFileDocument(filePath, plans);
    const nextContent = `${JSON.stringify(nextDocument, null, JSON_INDENT)}\n`;
    const currentContent = await readTextIfExists(filePath);

    if (currentContent !== nextContent) {
      updates.push({filePath, content: nextContent});
    }
  }

  if (CHECK_MODE && updates.length > 0) {
    const changedFiles = updates
      .map(({filePath}) => `  ${path.relative(ROOT_DIRECTORY, filePath)}`)
      .join('\n');
    throw new Error(
      `Generated token files are not current:\n${changedFiles}\nRun pnpm tokens:generate from the workspace root.`,
    );
  }

  if (!CHECK_MODE) {
    for (const update of updates) {
      await writeAtomically(update.filePath, update.content);
    }
  }

  const mode = CHECK_MODE ? 'Checked' : 'Generated';
  console.log(`${mode} ${filePlans.size} generated token file${filePlans.size === 1 ? '' : 's'}.`);
  if (!CHECK_MODE) {
    console.log(
      updates.length === 0
        ? 'No generated changes.'
        : `Updated ${updates.length} file${updates.length === 1 ? '' : 's'}.`,
    );
  }
}

/**
 * Loads and compiles the generation config and recipe schemas.
 *
 * @returns Compiled validators for global settings and each generator.
 */
async function loadValidators(): Promise<ValidationContext> {
  const ajv = new Ajv({
    allErrors: true,
    strictSchema: true,
    strictTypes: false,
  });
  const configSchema = await readJsonIfExists(GENERATION_CONFIG_SCHEMA_PATH);
  if (configSchema === null) {
    throw new Error(`Generation config schema does not exist: ${GENERATION_CONFIG_SCHEMA_PATH}`);
  }
  const configValidator = ajv.compile(configSchema);
  const recipeValidators = new Map<GeneratorName, ReturnType<Ajv['compile']>>();

  for (const generator of [
    'borderWidth',
    'breakpoint',
    'color',
    'dimension',
    'layer',
    'opacity',
    'radius',
    'typography',
  ] as const) {
    const schemaPath = path.join(SCHEMAS_DIRECTORY, `${generator}.recipe.schema.json`);
    const schema = await readJsonIfExists(schemaPath);
    if (schema === null) {
      throw new Error(`Recipe schema does not exist: ${schemaPath}`);
    }
    recipeValidators.set(generator, ajv.compile(schema));
  }

  return {configValidator, recipeValidators};
}

/**
 * Loads and validates the repository-wide generation configuration.
 *
 * @param validation The compiled configuration validator.
 * @returns Validated global generation settings.
 */
async function loadConfig(validation: ValidationContext): Promise<GenerationConfig> {
  const configValue = await readJsonIfExists(GENERATION_CONFIG_PATH);
  if (configValue === null) {
    throw new Error(`Generation config does not exist: ${GENERATION_CONFIG_PATH}`);
  }

  if (!validation.configValidator(configValue)) {
    const details = (validation.configValidator.errors ?? [])
      .map((error) => `${error.instancePath || '/'} ${error.message}`)
      .join('; ');
    throw new Error(`Invalid generation config: ${details}`);
  }

  return configValue as unknown as GenerationConfig;
}

/**
 * Discovers and validates every recipe under `generation/recipes`.
 *
 * @param validation The compiled recipe validators.
 * @returns Loaded recipes with their inferred generator metadata.
 */
async function loadRecipes(validation: ValidationContext): Promise<LoadedRecipe[]> {
  const recipeFiles = await findJsonFiles(RECIPES_DIRECTORY);
  const loaded: LoadedRecipe[] = [];

  for (const absolutePath of recipeFiles) {
    const relativePath = path.relative(RECIPES_DIRECTORY, absolutePath);
    const source = path.join('recipes', relativePath).split(path.sep).join('/');
    const recipeValue = await readJsonIfExists(absolutePath);
    if (recipeValue === null) {
      throw new Error(`Recipe does not exist: ${source}`);
    }
    const recipe = recipeValue as unknown as RecipeDocument;
    const generator = generatorForRecipe(recipe.$schema, absolutePath, relativePath);
    const validator = validation.recipeValidators.get(generator);

    if (!validator?.(recipe)) {
      const details = (validator?.errors ?? [])
        .map((error) => `${error.instancePath || '/'} ${error.message}`)
        .join('; ');
      throw new Error(`Invalid recipe ${source}: ${details}`);
    }

    loaded.push({relativePath, source, generator, recipe});
  }

  return loaded.sort((first, second) => first.relativePath.localeCompare(second.relativePath));
}

/**
 * Infers the generator name from a recipe schema reference.
 *
 * @param schemaReference The recipe `$schema` value.
 * @param recipePath The absolute recipe path used to resolve the schema reference.
 * @param relativePath The recipe path relative to `generation/recipes`.
 * @returns The generator that should process the recipe.
 */
function generatorForRecipe(
  schemaReference: string | undefined,
  recipePath: string,
  relativePath: string,
): GeneratorName {
  if (!schemaReference) {
    throw new Error(`Recipe is missing $schema: ${relativePath}`);
  }

  const resolvedSchemaPath = path.resolve(path.dirname(recipePath), schemaReference);
  for (const generator of [
    'borderWidth',
    'breakpoint',
    'color',
    'dimension',
    'layer',
    'opacity',
    'radius',
    'typography',
  ] as const) {
    const expectedSchemaPath = path.join(SCHEMAS_DIRECTORY, `${generator}.recipe.schema.json`);
    if (resolvedSchemaPath === expectedSchemaPath) {
      return generator;
    }
  }

  throw new Error(`Unsupported recipe schema in ${relativePath}: ${schemaReference}`);
}

/**
 * Expands recipes into generated patches and precomputes their output files.
 *
 * This also rejects duplicate generated token ownership across recipes.
 *
 * @param recipes The validated recipes.
 * @param config Global generation settings.
 * @returns Planned patches grouped with file and source metadata.
 */
function planPatches(recipes: LoadedRecipe[], config: GenerationConfig): PlannedPatch[] {
  const planned: PlannedPatch[] = [];
  const claimedLeafPaths = new Map<string, Array<{path: string[]; source: string}>>();

  for (const loaded of recipes) {
    const patches = generateRecipe(loaded, config);
    if (patches.length === 0) {
      throw new Error(`Recipe produced no generated patches: ${loaded.source}`);
    }

    for (const patch of patches) {
      if (patch.path.length === 0) {
        throw new Error(`Recipe produced an empty patch path: ${loaded.source}`);
      }

      const filePath = outputFilePathForPatch(loaded.relativePath, patch.type);
      ensureOutputPath(filePath);
      const leafPaths = collectLeafPaths(patch.value, patch.path);
      if (leafPaths.length === 0) {
        throw new Error(
          `Recipe produced no token leaves at ${patch.path.join('.')}: ${loaded.source}`,
        );
      }

      const claims = claimedLeafPaths.get(filePath) ?? [];
      for (const leafPath of leafPaths) {
        const conflict = claims.find((claim) =>
          tokenPathsStructurallyOverlap(claim.path, leafPath),
        );
        if (conflict) {
          throw new Error(
            `Generated token path conflict in ${path.relative(ROOT_DIRECTORY, filePath)}: ` +
              `${conflict.path.join('.')} from ${conflict.source} overlaps ` +
              `${leafPath.join('.')} from ${loaded.source}`,
          );
        }
        claims.push({path: leafPath, source: loaded.source});
      }
      claimedLeafPaths.set(filePath, claims);

      planned.push({
        filePath,
        source: loaded.source,
        patch,
        leafPaths,
      });
    }
  }

  return planned;
}

/**
 * Dispatches one recipe to its matching generator implementation.
 *
 * @param loaded The loaded recipe and its inferred generator.
 * @param config Global generation settings.
 * @returns The generated token patches.
 */
function generateRecipe(loaded: LoadedRecipe, config: GenerationConfig): GeneratedTokenPatch[] {
  switch (loaded.generator) {
    case 'borderWidth':
      return generateBorderWidthTokens(loaded.recipe as BorderWidthRecipe);
    case 'breakpoint':
      return generateBreakpointTokens(loaded.recipe as BreakpointRecipe);
    case 'color':
      return generateColorTokens(loaded.recipe as ColorRecipe);
    case 'dimension':
      return generateDimensionTokens(loaded.recipe as DimensionRecipe, config);
    case 'layer':
      return generateLayerTokens(loaded.recipe as LayerRecipe);
    case 'opacity':
      return generateOpacityTokens(loaded.recipe as OpacityRecipe);
    case 'radius':
      return generateRadiusTokens(loaded.recipe as RadiusRecipe, config);
    case 'typography':
      return generateTypographyTokens(loaded.recipe as TypographyRecipe, config);
  }
}

/**
 * Derives the output token file from the mirrored recipe path and DTCG type.
 *
 * @param relativeRecipePath The recipe path relative to `generation/recipes`.
 * @param type The DTCG token type for the patch.
 * @returns The output token file path.
 */
function outputFilePathForPatch(relativeRecipePath: string, type: string): string {
  const relativeDirectory = path.dirname(relativeRecipePath);
  return path.join(TOKENS_DIRECTORY, relativeDirectory, `${type}.tokens.json`);
}

/**
 * Ensures that a generated output remains below the repository token directory.
 *
 * @param outputPath The output path to validate.
 */
function ensureOutputPath(outputPath: string): void {
  const relativePath = path.relative(TOKENS_DIRECTORY, outputPath);
  if (
    relativePath === '..' ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error(`Generated output is outside the token directory: ${outputPath}`);
  }
}

/**
 * Checks whether two token paths are identical or one traverses through the other.
 *
 * Group paths may overlap, but a token leaf cannot also be the parent of another
 * generated token.
 *
 * @param first The first token leaf path.
 * @param second The second token leaf path.
 * @returns Whether the paths conflict structurally.
 */
function tokenPathsStructurallyOverlap(first: string[], second: string[]): boolean {
  const sharedLength = Math.min(first.length, second.length);
  for (let index = 0; index < sharedLength; index += 1) {
    if (first[index] !== second[index]) {
      return false;
    }
  }
  return true;
}

/**
 * Buckets planned patches by destination token file.
 *
 * @param planned The flat list of planned patches.
 * @returns Patches grouped by output file path.
 */
function groupPatchesByFile(planned: PlannedPatch[]): Map<string, PlannedPatch[]> {
  const grouped = new Map<string, PlannedPatch[]>();
  for (const patch of planned) {
    const existing = grouped.get(patch.filePath);
    if (existing) {
      existing.push(patch);
    } else {
      grouped.set(patch.filePath, [patch]);
    }
  }
  return grouped;
}

/**
 * Builds the next version of a generated token file.
 *
 * Existing manual tokens are preserved, generated tokens are overwritten, and
 * stale generated tokens from active sources are swept afterward.
 *
 * @param filePath The output token file path.
 * @param plans The patches targeting that file.
 * @returns The next document contents.
 */
async function buildFileDocument(filePath: string, plans: PlannedPatch[]): Promise<JsonObject> {
  const existing = await readJsonIfExists(filePath);
  const document = existing ?? createEmptyDocument();
  const emittedLeafPathsBySource = new Map<string, Set<string>>();

  for (const plan of plans) {
    const marker: GenerationMarker = {
      source: plan.source,
    };
    const stampedValue = stampGeneratedTokens(plan.patch.value, marker);
    ensureGroupType(document, plan.patch.path, plan.patch.type);
    mergeAtPath(document, plan.patch.path, stampedValue);

    const emitted = emittedLeafPathsBySource.get(plan.source) ?? new Set<string>();
    for (const leafPath of plan.leafPaths) {
      emitted.add(tokenPathKey(leafPath));
    }
    emittedLeafPathsBySource.set(plan.source, emitted);
  }

  sweepGeneratedTokens(document, emittedLeafPathsBySource);
  return document;
}

/**
 * Creates a new generated token document with repository-wide metadata.
 *
 * @returns An empty token document.
 */
function createEmptyDocument(): JsonObject {
  return {
    $schema: FORMAT_SCHEMA,
    $description: GENERATED_DESCRIPTION,
  };
}

/**
 * Ensures the owning group for a patch declares the expected DTCG type.
 *
 * @param document The token document being built.
 * @param patchPath The generated patch path.
 * @param type The DTCG token type for that patch.
 */
function ensureGroupType(document: JsonObject, patchPath: string[], type: string): void {
  const typeIndex = patchPath.indexOf(type);
  if (typeIndex < 0) {
    throw new Error(
      `Generated path does not include its DTCG type (${type}): ${patchPath.join('.')}`,
    );
  }

  const groupPath = patchPath.slice(0, typeIndex + 1);
  const group = ensureObjectPath(document, groupPath);
  const existingType = group.$type;
  if (existingType !== undefined && existingType !== type) {
    throw new Error(
      `Conflicting $type at ${groupPath.join('.')}: ${String(existingType)} vs ${type}`,
    );
  }
  group.$type = type;
}

/**
 * Ensures that a nested object path exists and returns the final group node.
 *
 * @param root The root object.
 * @param objectPath The group path to create or read.
 * @returns The group at the requested path.
 */
function ensureObjectPath(root: JsonObject, objectPath: string[]): JsonObject {
  let current = root;
  for (const segment of objectPath) {
    const next = current[segment];
    if (next === undefined) {
      current[segment] = {};
      current = current[segment] as JsonObject;
      continue;
    }

    if (!isJsonObject(next) || isToken(next)) {
      throw new Error(`Path is not a group: ${objectPath.join('.')}`);
    }
    current = next;
  }
  return current;
}

/**
 * Merges a generated subtree into the document at the target patch path.
 *
 * @param root The token document.
 * @param patchPath The patch path.
 * @param value The stamped generated subtree.
 */
function mergeAtPath(root: JsonObject, patchPath: string[], value: JsonObject): void {
  const parent = ensureObjectPath(root, patchPath.slice(0, -1));
  const key = patchPath[patchPath.length - 1];
  const existing = parent[key];

  if (existing === undefined) {
    parent[key] = cloneJson(value);
    return;
  }

  if (!isJsonObject(existing)) {
    throw new Error(`Generated path is not an object: ${patchPath.join('.')}`);
  }

  const existingIsToken = isToken(existing);
  const incomingIsToken = isToken(value);
  if (existingIsToken && incomingIsToken) {
    parent[key] = cloneJson(value);
    return;
  }
  if (existingIsToken !== incomingIsToken) {
    throw new Error(
      `Generated path conflicts with an existing ${existingIsToken ? 'token' : 'group'}: ` +
        patchPath.join('.'),
    );
  }

  parent[key] = mergeObjects(existing, value, patchPath);
}

/**
 * Deep-merges two group objects while replacing token leaves wholesale.
 *
 * A token may replace another token at the same path, but a token and group
 * cannot replace one another because doing so could silently delete manually
 * authored descendants.
 *
 * @param target The existing group object.
 * @param source The incoming generated group object.
 * @param groupPath The path of the groups being merged.
 * @returns The merged object.
 */
function mergeObjects(target: JsonObject, source: JsonObject, groupPath: string[]): JsonObject {
  const merged = cloneJson(target);

  for (const [key, incoming] of Object.entries(source)) {
    if (isGroupMetadataKey(key)) {
      merged[key] = cloneJson(incoming);
      continue;
    }

    const tokenPath = [...groupPath, key];
    const current = merged[key];
    if (current === undefined) {
      merged[key] = cloneJson(incoming);
      continue;
    }
    if (!isJsonObject(incoming) || !isJsonObject(current)) {
      throw new Error(`Token path is not an object: ${tokenPath.join('.')}`);
    }

    const currentIsToken = isToken(current);
    const incomingIsToken = isToken(incoming);
    if (currentIsToken && incomingIsToken) {
      merged[key] = cloneJson(incoming);
    } else if (!currentIsToken && !incomingIsToken) {
      merged[key] = mergeObjects(current, incoming, tokenPath);
    } else {
      throw new Error(
        `Generated token path conflicts with an existing ${currentIsToken ? 'token' : 'group'}: ` +
          tokenPath.join('.'),
      );
    }
  }

  return merged;
}

/**
 * Removes previously generated token leaves that were not re-emitted this run.
 *
 * @param document The token document being built.
 * @param emittedLeafPathsBySource Generated token paths emitted per recipe source.
 */
function sweepGeneratedTokens(
  document: JsonObject,
  emittedLeafPathsBySource: Map<string, Set<string>>,
): void {
  const generatedTokenPaths = collectGeneratedTokenPaths(document, []);
  for (const item of generatedTokenPaths) {
    const emitted = emittedLeafPathsBySource.get(item.marker.source);
    if (emitted?.has(tokenPathKey(item.path))) {
      continue;
    }
    deleteTokenAtPath(document, item.path);
  }
}

/**
 * Collects token paths carrying the generation ownership marker.
 *
 * @param node The current subtree.
 * @param currentPath The current token path.
 * @returns All marked generated token paths in the subtree.
 */
function collectGeneratedTokenPaths(
  node: JsonValue,
  currentPath: string[],
): Array<{path: string[]; marker: GenerationMarker}> {
  if (!isJsonObject(node)) {
    return [];
  }

  if (isToken(node)) {
    const marker = generationMarkerForToken(node, currentPath);
    return marker ? [{path: currentPath, marker}] : [];
  }

  const collected: Array<{path: string[]; marker: GenerationMarker}> = [];
  for (const [key, child] of Object.entries(node)) {
    if (isGroupMetadataKey(key)) {
      continue;
    }
    collected.push(...collectGeneratedTokenPaths(child, [...currentPath, key]));
  }
  return collected;
}

/**
 * Reads the generation marker from a token node, if present.
 *
 * @param tokenNode The token node.
 * @returns The parsed generation marker, or `null` when absent.
 * @throws When generation metadata is present but malformed.
 */
function generationMarkerForToken(
  tokenNode: JsonObject,
  tokenPath: string[],
): GenerationMarker | null {
  const extensions = tokenNode.$extensions;
  if (extensions === undefined) {
    return null;
  }
  if (!isJsonObject(extensions)) {
    throw new Error(`Token has invalid $extensions: ${tokenPath.join('.')}`);
  }

  const marker = extensions[GENERATION_EXTENSION_KEY];
  if (marker === undefined) {
    return null;
  }
  if (!isJsonObject(marker) || typeof marker.source !== 'string' || marker.source.length === 0) {
    throw new Error(
      `Token has invalid ${GENERATION_EXTENSION_KEY} metadata: ${tokenPath.join('.')}`,
    );
  }

  return {source: marker.source};
}

/**
 * Deletes a token leaf and prunes now-empty parent groups.
 *
 * @param root The token document.
 * @param tokenPath The token path to remove.
 */
function deleteTokenAtPath(root: JsonObject, tokenPath: string[]): void {
  const ancestors: Array<{node: JsonObject; key: string}> = [];
  let current = root;

  for (let index = 0; index < tokenPath.length - 1; index += 1) {
    const key = tokenPath[index];
    const next = current[key];
    if (!isJsonObject(next) || isToken(next)) {
      return;
    }
    ancestors.push({node: current, key});
    current = next;
  }

  delete current[tokenPath[tokenPath.length - 1]];

  for (let index = ancestors.length - 1; index >= 0; index -= 1) {
    const {node, key} = ancestors[index];
    const child = node[key];
    if (!isJsonObject(child) || isToken(child)) {
      return;
    }
    if (Object.keys(child).length > 0) {
      return;
    }
    delete node[key];
  }
}

/**
 * Collects every token leaf path inside a generated subtree.
 *
 * @param value The subtree to scan.
 * @param currentPath The current token path.
 * @returns The token leaf paths under the subtree.
 */
function collectLeafPaths(value: JsonValue, currentPath: string[]): string[][] {
  if (!isJsonObject(value)) {
    return [];
  }

  if (isToken(value)) {
    return [currentPath];
  }

  const collected: string[][] = [];
  for (const [key, child] of Object.entries(value)) {
    if (isGroupMetadataKey(key)) {
      continue;
    }
    collected.push(...collectLeafPaths(child, [...currentPath, key]));
  }
  return collected;
}

/**
 * Checks whether a group key is DTCG metadata rather than a child token/group.
 * `$root` is excluded because it is a token at the group's root.
 *
 * @param key The group property name.
 * @returns Whether the key contains group metadata.
 */
function isGroupMetadataKey(key: string): boolean {
  return key.startsWith('$') && key !== '$root';
}

/**
 * Encodes a token path without ambiguity between path segments.
 *
 * @param tokenPath The token path to encode.
 * @returns A stable path key.
 */
function tokenPathKey(tokenPath: string[]): string {
  return JSON.stringify(tokenPath);
}

/**
 * Recursively finds JSON files below a directory.
 *
 * @param directory The directory to scan.
 * @returns Sorted absolute file paths.
 */
async function findJsonFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, {withFileTypes: true});
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findJsonFiles(absolutePath)));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(absolutePath);
    }
  }

  return files.sort();
}

/**
 * Finds every DTCG token file below a directory.
 *
 * @param directory The directory to scan.
 * @returns Sorted absolute token file paths.
 */
async function findTokenFiles(directory: string): Promise<string[]> {
  return (await findJsonFiles(directory)).filter((filePath) => filePath.endsWith('.tokens.json'));
}

/**
 * Reads a JSON file when it exists.
 *
 * @param filePath The file path to read.
 * @returns The parsed JSON object, or `null` when absent.
 */
async function readJsonIfExists(filePath: string): Promise<JsonObject | null> {
  const content = await readTextIfExists(filePath);
  if (content === null) {
    return null;
  }

  const parsed = parseJson(content, path.relative(ROOT_DIRECTORY, filePath));
  if (!isJsonObject(parsed)) {
    throw new Error(`${path.relative(ROOT_DIRECTORY, filePath)} must contain a JSON object`);
  }
  return parsed;
}

/**
 * Reads a text file when it exists.
 *
 * @param filePath The file path to read.
 * @returns The file contents, or `null` when absent.
 */
async function readTextIfExists(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Writes a complete output file without exposing partially written JSON.
 *
 * @param filePath The final output path.
 * @param content The complete file contents.
 */
async function writeAtomically(filePath: string, content: string): Promise<void> {
  await mkdir(path.dirname(filePath), {recursive: true});
  const temporaryPath = `${filePath}.${process.pid}.tmp`;

  try {
    await writeFile(temporaryPath, content, 'utf8');
    await rename(temporaryPath, filePath);
  } catch (error) {
    await rm(temporaryPath, {force: true});
    throw error;
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
