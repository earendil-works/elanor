#!/usr/bin/env node

import {readFile} from 'node:fs/promises';
import path from 'node:path';

import Color from 'colorjs.io';

import {isJsonObject, parseJson} from '../generation/src/dtcg';
import type {JsonValue} from '../generation/src/types';

const ROOT_DIRECTORY = path.join(__dirname, '..');
const TOKEN_DIRECTORY = path.join(ROOT_DIRECTORY, 'tokens', 'shared');
const REQUIRED_TEXT_CONTRAST = 4.5;
const REQUIRED_NON_TEXT_CONTRAST = 3;
const INTERACTIVE_KEYS = new Set(['hover', 'active']);
const MODES = ['light', 'dark'] as const;

type Mode = (typeof MODES)[number];

type ColorToken =
  | {readonly kind: 'alias'; readonly path: string}
  | {readonly kind: 'color'; readonly color: Color}
  | {readonly kind: 'pointer'};

interface TokenTree {
  readonly token: ColorToken | undefined;
  readonly children: ReadonlyMap<string, TokenTree>;
}

interface ColorDocuments {
  readonly primitive: TokenTree;
  readonly light: TokenTree;
  readonly dark: TokenTree;
}

interface ContrastPair {
  readonly foreground: string;
  readonly background: string;
}

interface ContrastRule {
  readonly category: string;
  readonly threshold: number;
  readonly pairs: readonly ContrastPair[];
}

interface ContrastCheck extends ContrastPair {
  readonly mode: Mode;
  readonly category: string;
  readonly threshold: number;
}

interface ContrastResult extends ContrastCheck {
  readonly foregroundColor: Color;
  readonly backgroundColor: Color;
  readonly ratio: number;
}

/** Reads a color token file and decodes it into a resting-state token tree. */
async function readColorTokenFile(file: string): Promise<TokenTree> {
  return decodeColorTokenFile(await readFile(file, 'utf8'), path.relative(ROOT_DIRECTORY, file));
}

/** Decodes a DTCG color token document, dropping hover and active states. */
function decodeColorTokenFile(source: string, file: string): TokenTree {
  return decodeTree(parseJson(source, file), file);
}

/** Converts an unknown error into display text. */
function errorMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

/** Returns whether a JSON value is a finite number. */
function isJsonNumber(value: JsonValue): value is number {
  return Number.isFinite(value);
}

/** Decodes one DTCG object into a token tree node. */
function decodeTree(value: JsonValue, label: string): TokenTree {
  if (!isJsonObject(value)) {
    throw new Error(`${label}: expected an object`);
  }

  const fields = new Map(Object.entries(value));
  let token: ColorToken | undefined;
  const rawValue = fields.get('$value');
  const rawRoot = fields.get('$root');

  if (rawValue !== undefined) {
    token = decodeTokenValue(rawValue, label);
  } else if (rawRoot !== undefined) {
    const root = decodeTree(rawRoot, `${label}.$root`);
    if (root.token === undefined) {
      throw new Error(`${label}.$root is not a token`);
    }
    token = root.token;
  }

  const children = new Map<string, TokenTree>();
  for (const [key, child] of fields) {
    if (key.startsWith('$') || INTERACTIVE_KEYS.has(key)) continue;
    children.set(key, decodeTree(child, `${label}.${key}`));
  }

  return {token, children};
}

/** Decodes a DTCG `$value` into an alias or a concrete colorjs color. */
function decodeTokenValue(value: JsonValue, label: string): ColorToken {
  if (typeof value === 'string') {
    const alias = /^\{(.+)\}$/.exec(value);
    const path = alias?.[1];
    if (path === undefined || path === '') {
      throw new Error(`Unsupported string value at ${label}: ${value}`);
    }
    return {kind: 'alias', path};
  }

  if (!isJsonObject(value)) {
    throw new Error(`Unsupported color value at ${label}`);
  }

  const fields = new Map(Object.entries(value));
  const colorSpace = fields.get('colorSpace');
  const components = fields.get('components');
  const alpha = fields.get('alpha');
  if (hasJsonPointer(colorSpace) || hasJsonPointer(alpha) || hasJsonPointerItems(components)) {
    return {kind: 'pointer'};
  }
  if (
    colorSpace === undefined ||
    typeof colorSpace !== 'string' ||
    !Array.isArray(components) ||
    components.length !== 3
  ) {
    throw new Error(`Expected a concrete three-component color at ${label}`);
  }

  const [first, second, third] = components;
  if (
    first === undefined ||
    second === undefined ||
    third === undefined ||
    !isJsonNumber(first) ||
    !isJsonNumber(second) ||
    !isJsonNumber(third)
  ) {
    throw new Error(`Expected a concrete three-component color at ${label}`);
  }
  if (alpha !== undefined && !isJsonNumber(alpha)) {
    throw new Error(`Expected a concrete three-component color at ${label}`);
  }

  return {
    kind: 'color',
    color: new Color(colorSpace, [first, second, third], alpha === undefined ? 1 : alpha),
  };
}

/** Returns whether a DTCG field is a JSON Pointer object rather than a literal. */
function hasJsonPointer(value: JsonValue | undefined): boolean {
  return value !== undefined && isJsonPointer(value);
}

/** Returns whether any list item is a JSON Pointer object. */
function hasJsonPointerItems(value: JsonValue | undefined): boolean {
  return Array.isArray(value) && value.some(isJsonPointer);
}

/** Returns whether a JSON value is a DTCG `$ref` pointer. */
function isJsonPointer(value: JsonValue): boolean {
  return isJsonObject(value) && typeof value.$ref === 'string';
}

/** Lists logical token paths present in a resting-state tree. */
function listTokenPaths(tree: TokenTree): string[] {
  const paths: string[] = [];
  collectTokenPaths(tree, [], paths);
  return paths.sort();
}

/** Collects token paths from a tree node. */
function collectTokenPaths(node: TokenTree, prefix: readonly string[], paths: string[]): void {
  if (node.token !== undefined && prefix.length > 0) {
    paths.push(prefix.join('.'));
  }
  for (const [key, child] of node.children) {
    collectTokenPaths(child, [...prefix, key], paths);
  }
}

/** Requires light and dark documents to expose the same resting color tokens. */
function sharedRestingPaths(light: TokenTree, dark: TokenTree): string[] {
  const lightPaths = listTokenPaths(light);
  const darkPaths = listTokenPaths(dark);
  if (lightPaths.join('\n') !== darkPaths.join('\n')) {
    throw new Error('Light and dark semantic color documents expose different resting tokens');
  }
  return lightPaths;
}

/** Returns resting tokens under a prefix, optionally filtered by the relative path. */
function under(
  paths: readonly string[],
  prefix: string,
  keep: (relative: string) => boolean = () => true,
): string[] {
  const found: string[] = [];
  for (const tokenPath of paths) {
    if (tokenPath === prefix) {
      if (keep('')) found.push(tokenPath);
      continue;
    }
    if (!tokenPath.startsWith(`${prefix}.`)) continue;
    if (keep(tokenPath.slice(prefix.length + 1))) found.push(tokenPath);
  }
  if (found.length === 0) {
    throw new Error(`No resting color tokens under ${prefix}`);
  }
  return found;
}

/** Returns a token path that must exist in the discovered set. */
function requirePath(paths: ReadonlySet<string>, tokenPath: string): string {
  if (!paths.has(tokenPath)) {
    throw new Error(`Unknown color token path: ${tokenPath}`);
  }
  return tokenPath;
}

/** Returns the path suffix after a prefix. */
function suffixAfter(tokenPath: string, prefix: string): string {
  if (tokenPath === prefix) return '';
  if (!tokenPath.startsWith(`${prefix}.`)) {
    throw new Error(`${tokenPath} is not under ${prefix}`);
  }
  return tokenPath.slice(prefix.length + 1);
}

/** Pairs two token groups that share the same suffixes. */
function pairBySuffix(
  foregrounds: readonly string[],
  foregroundPrefix: string,
  backgrounds: readonly string[],
  backgroundPrefix: string,
): ContrastPair[] {
  const foregroundBySuffix = new Map(
    foregrounds.map((tokenPath) => [suffixAfter(tokenPath, foregroundPrefix), tokenPath]),
  );
  const backgroundBySuffix = new Map(
    backgrounds.map((tokenPath) => [suffixAfter(tokenPath, backgroundPrefix), tokenPath]),
  );
  const foregroundSuffixes = [...foregroundBySuffix.keys()].sort();
  const backgroundSuffixes = [...backgroundBySuffix.keys()].sort();
  if (foregroundSuffixes.join('\n') !== backgroundSuffixes.join('\n')) {
    throw new Error(
      `Mismatched contrast pair suffixes between ${foregroundPrefix} and ${backgroundPrefix}`,
    );
  }

  return foregroundSuffixes.map((suffix) => {
    const foreground = foregroundBySuffix.get(suffix);
    const background = backgroundBySuffix.get(suffix);
    if (foreground === undefined || background === undefined) {
      throw new Error(
        `Mismatched contrast pair suffixes between ${foregroundPrefix} and ${backgroundPrefix}`,
      );
    }
    return {foreground, background};
  });
}

/** Expands every foreground against every background. */
function everyCombination(
  foregrounds: readonly string[],
  backgrounds: readonly string[],
): ContrastPair[] {
  return foregrounds.flatMap((foreground) =>
    backgrounds.map((background) => ({foreground, background})),
  );
}

/**
 * Builds required resting-state contrast relationships from discovered tokens.
 *
 * Hover and active states are absent because they are not contrast conformance
 * targets under project policy. Rules name groups and pairings; token files
 * own the concrete names.
 */
function createRules(paths: readonly string[]): ContrastRule[] {
  const pathSet = new Set(paths);
  const page = under(
    paths,
    'semantic.color.background',
    (relative) => relative === 'canvas' || relative === 'surface',
  );
  if (page.length !== 2) {
    throw new Error(`Expected canvas and surface page backgrounds, found: ${page.join(', ')}`);
  }

  const primaryFills = under(paths, 'semantic.color.background.fill.primary');
  const secondaryFills = under(paths, 'semantic.color.background.fill.secondary');
  const statusSecondaryFills = under(
    paths,
    'semantic.color.background.fill.secondary',
    (relative) => relative !== '',
  );
  const statusBorders = under(
    paths,
    'semantic.color.border',
    (relative) => relative !== 'primary' && relative !== 'secondary',
  );

  return [
    {
      category: 'text/page',
      threshold: REQUIRED_TEXT_CONTRAST,
      pairs: everyCombination(
        under(
          paths,
          'semantic.color.text',
          (relative) => !relative.startsWith('on') && !relative.startsWith('code'),
        ),
        page,
      ),
    },
    {
      // Code snippets and inline code set source code on the secondary fill.
      category: 'text/code-on-secondary-fill',
      threshold: REQUIRED_TEXT_CONTRAST,
      pairs: everyCombination(under(paths, 'semantic.color.text.code'), [
        requirePath(pathSet, 'semantic.color.background.fill.secondary'),
      ]),
    },
    {
      category: 'icon/page',
      threshold: REQUIRED_NON_TEXT_CONTRAST,
      pairs: everyCombination(
        under(
          paths,
          'semantic.color.icon',
          (relative) =>
            !relative.startsWith('on') &&
            !relative.startsWith('checkbox') &&
            !relative.startsWith('radio'),
        ),
        page,
      ),
    },
    {
      category: 'text/on-primary-fill',
      threshold: REQUIRED_TEXT_CONTRAST,
      pairs: everyCombination(
        [requirePath(pathSet, 'semantic.color.text.onPrimaryFill')],
        primaryFills,
      ),
    },
    {
      category: 'icon/on-primary-fill',
      threshold: REQUIRED_NON_TEXT_CONTRAST,
      pairs: everyCombination(
        [requirePath(pathSet, 'semantic.color.icon.onPrimaryFill')],
        primaryFills,
      ),
    },
    {
      category: 'fill/primary-boundary',
      threshold: REQUIRED_NON_TEXT_CONTRAST,
      pairs: everyCombination(primaryFills, page),
    },
    {
      category: 'text/on-secondary-fill',
      threshold: REQUIRED_TEXT_CONTRAST,
      pairs: pairBySuffix(
        under(paths, 'semantic.color.text.onSecondaryFill'),
        'semantic.color.text.onSecondaryFill',
        secondaryFills,
        'semantic.color.background.fill.secondary',
      ),
    },
    {
      category: 'icon/on-secondary-fill',
      threshold: REQUIRED_NON_TEXT_CONTRAST,
      pairs: pairBySuffix(
        under(paths, 'semantic.color.icon.onSecondaryFill'),
        'semantic.color.icon.onSecondaryFill',
        secondaryFills,
        'semantic.color.background.fill.secondary',
      ),
    },
    {
      category: 'border/primary',
      threshold: REQUIRED_NON_TEXT_CONTRAST,
      pairs: everyCombination([requirePath(pathSet, 'semantic.color.border.primary')], page),
    },
    {
      category: 'border/status',
      threshold: REQUIRED_NON_TEXT_CONTRAST,
      pairs: everyCombination(statusBorders, page),
    },
    {
      category: 'border/status-vs-secondary-fill',
      threshold: REQUIRED_NON_TEXT_CONTRAST,
      pairs: pairBySuffix(
        statusBorders,
        'semantic.color.border',
        statusSecondaryFills,
        'semantic.color.background.fill.secondary',
      ),
    },
    {
      category: 'focus-ring',
      threshold: REQUIRED_NON_TEXT_CONTRAST,
      pairs: everyCombination(under(paths, 'semantic.color.focusRing'), page),
    },
    {
      category: 'fill/selected-boundary',
      threshold: REQUIRED_NON_TEXT_CONTRAST,
      pairs: everyCombination(
        [requirePath(pathSet, 'semantic.color.background.fill.selected')],
        page,
      ),
    },
    {
      category: 'icon/on-selected-fill',
      threshold: REQUIRED_NON_TEXT_CONTRAST,
      pairs: [
        {
          foreground: requirePath(pathSet, 'semantic.color.icon.onSelectedFill'),
          background: requirePath(pathSet, 'semantic.color.background.fill.selected'),
        },
      ],
    },
    {
      category: 'slider/progress-vs-track',
      threshold: REQUIRED_NON_TEXT_CONTRAST,
      pairs: [
        {
          foreground: requirePath(pathSet, 'semantic.color.background.fill.selected'),
          background: requirePath(pathSet, 'semantic.color.background.fill.secondary'),
        },
      ],
    },
    {
      category: 'switch/off-track-boundary',
      threshold: REQUIRED_NON_TEXT_CONTRAST,
      pairs: everyCombination([requirePath(pathSet, 'semantic.color.background.switch')], page),
    },
    {
      category: 'switch/knob-vs-track',
      threshold: REQUIRED_NON_TEXT_CONTRAST,
      pairs: everyCombination(
        [requirePath(pathSet, 'semantic.color.background.switch.knob')],
        [
          requirePath(pathSet, 'semantic.color.background.switch'),
          requirePath(pathSet, 'semantic.color.background.switch.selected'),
        ],
      ),
    },
    {
      category: 'slider/endstop-vs-track',
      threshold: REQUIRED_NON_TEXT_CONTRAST,
      pairs: [
        {
          foreground: requirePath(pathSet, 'semantic.color.background.slider.track.endstop'),
          background: requirePath(pathSet, 'semantic.color.background.slider.track'),
        },
      ],
    },
    {
      category: 'meter/indicator-vs-track',
      threshold: REQUIRED_NON_TEXT_CONTRAST,
      pairs: everyCombination(
        [
          requirePath(pathSet, 'semantic.color.background.fill.dataViz.100'),
          requirePath(pathSet, 'semantic.color.border.warning'),
          requirePath(pathSet, 'semantic.color.background.fill.primary.negative'),
        ],
        [requirePath(pathSet, 'semantic.color.background.fill.secondary')],
      ),
    },
  ];
}

/** Expands the discovered rules into checks for both color modes. */
function createChecks(paths: readonly string[]): ContrastCheck[] {
  const checks: ContrastCheck[] = [];
  const rules = createRules(paths);

  for (const mode of MODES) {
    for (const rule of rules) {
      for (const {foreground, background} of rule.pairs) {
        checks.push({
          mode,
          category: rule.category,
          foreground,
          background,
          threshold: rule.threshold,
        });
      }
    }
  }

  return checks;
}

/** Resolves a token path to the concrete colorjs color it aliases. */
function resolveColor(
  mode: Mode,
  tokenPath: string,
  documents: ColorDocuments,
  stack: string[] = [],
): Color {
  const cycleKey = `${mode}:${tokenPath}`;
  if (stack.includes(cycleKey)) {
    throw new Error(`Circular color alias: ${[...stack, cycleKey].join(' -> ')}`);
  }

  const document = tokenPath.startsWith('primitive.') ? documents.primitive : documents[mode];
  const token = tokenAt(document, tokenPath);
  if (token.kind === 'color') return token.color;
  if (token.kind === 'pointer') {
    throw new Error(
      `${mode} ${tokenPath} uses a JSON Pointer color and cannot be contrast-checked`,
    );
  }
  return resolveColor(mode, token.path, documents, [...stack, cycleKey]);
}

/** Returns the token stored at a logical path, including explicit `$root`. */
function tokenAt(tree: TokenTree, tokenPath: string): ColorToken {
  let node = tree;
  for (const segment of tokenPath.split('.')) {
    if (segment === '$root') continue;
    const child = node.children.get(segment);
    if (child === undefined) {
      throw new Error(`Unknown color token path: ${tokenPath}`);
    }
    node = child;
  }
  if (node.token === undefined) {
    throw new Error(`Color path is not a token: ${tokenPath}`);
  }
  return node.token;
}

/** Displays a resolved color compactly in a failure message. */
function displayColor(color: Color): string {
  return color.to('srgb').toString({format: 'hex', collapse: false}).toUpperCase();
}

/** Checks all required semantic pairs and exits unsuccessfully on any failure. */
async function main(): Promise<void> {
  const [primitive, light, dark] = await Promise.all([
    readColorTokenFile(path.join(TOKEN_DIRECTORY, 'primitive', 'color.tokens.json')),
    readColorTokenFile(path.join(TOKEN_DIRECTORY, 'semantic', 'color', 'light.tokens.json')),
    readColorTokenFile(path.join(TOKEN_DIRECTORY, 'semantic', 'color', 'dark.tokens.json')),
  ]);
  const documents = {primitive, light, dark};
  const checks = createChecks(sharedRestingPaths(light, dark));
  const checkKeys = checks.map(
    ({mode, category, foreground, background}) => `${mode}|${category}|${foreground}|${background}`,
  );
  const duplicateCheckKeys = checkKeys.filter((key, index) => checkKeys.indexOf(key) !== index);
  if (duplicateCheckKeys.length > 0) {
    throw new Error(
      `Duplicate color contrast checks:\n${[...new Set(duplicateCheckKeys)].join('\n')}`,
    );
  }

  const results: ContrastResult[] = checks.map((check) => {
    const foregroundColor = resolveColor(check.mode, check.foreground, documents);
    const backgroundColor = resolveColor(check.mode, check.background, documents);
    return {
      ...check,
      foregroundColor,
      backgroundColor,
      ratio: foregroundColor.contrast(backgroundColor, 'WCAG21'),
    };
  });
  const failures = results.filter((result) => result.ratio < result.threshold);

  if (failures.length > 0) {
    console.error(
      `Color contrast failed for ${failures.length} of ${results.length} required resting-state pairs:`,
    );
    for (const failure of failures.sort((a, b) => a.ratio - b.ratio)) {
      console.error(
        [
          `- ${failure.mode} ${failure.category}:`,
          `${failure.foreground} (${displayColor(failure.foregroundColor)})`,
          `on ${failure.background} (${displayColor(failure.backgroundColor)})`,
          `is ${failure.ratio.toFixed(2)}:1; requires ${failure.threshold.toFixed(1)}:1`,
        ].join(' '),
      );
    }
    process.exitCode = 1;
    return;
  }

  const weakest = [...results].sort((a, b) => a.ratio / a.threshold - b.ratio / b.threshold)[0];
  if (weakest === undefined) {
    throw new Error('Expected at least one color contrast check');
  }
  console.log(
    `Validated ${results.length} required resting-state color contrast pairs (WCAG 2.1).`,
  );
  console.log(
    `Weakest relative pass: ${weakest.mode} ${weakest.foreground} on ${weakest.background} at ${weakest.ratio.toFixed(2)}:1 (requires ${weakest.threshold.toFixed(1)}:1).`,
  );
}

main().catch((cause: unknown) => {
  console.error(errorMessage(cause));
  process.exitCode = 1;
});
