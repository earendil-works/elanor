#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import Ajv, {
  type AnySchema,
  type ErrorObject,
  type ValidateFunction,
} from "ajv";
import addFormats from "ajv-formats";

const ROOT_DIRECTORY = path.join(__dirname, "..");
const TOKENS_DIRECTORY = path.join(ROOT_DIRECTORY, "tokens");
const SCHEMA_VERSION = "2025.10";
const SCHEMA_DIRECTORY = path.join(
  ROOT_DIRECTORY,
  "schemas",
  "dtcg",
  SCHEMA_VERSION,
);
const SCHEMA_NAMES = ["format", "resolver"] as const;

type SchemaName = (typeof SCHEMA_NAMES)[number];

interface Manifest {
  version: string;
  schemas: Record<SchemaName, { sha256: string; url: string }>;
}

interface JsonFile<T> {
  content: Buffer;
  value: T;
}

/**
 * Converts an unknown error into display text.
 *
 * @param error The thrown value.
 * @returns A readable error message.
 */
function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Calculates the SHA-256 digest of file content.
 *
 * @param content The file content.
 * @returns A lowercase hexadecimal digest.
 */
function sha256(content: Buffer): string {
  return createHash("sha256").update(content).digest("hex");
}

/**
 * Reads a JSON file and preserves its original bytes.
 *
 * @param file The absolute file path.
 * @returns The parsed value and original content.
 * @throws When the file cannot be read or parsed.
 */
async function readJson<T = unknown>(file: string): Promise<JsonFile<T>> {
  const content = await readFile(file);

  try {
    return { content, value: JSON.parse(content.toString("utf8")) as T };
  } catch (error) {
    throw new Error(
      `${path.relative(ROOT_DIRECTORY, file)}: ${errorMessage(error)}`,
    );
  }
}

/**
 * Finds every file below a directory in stable order.
 *
 * @param directory The directory to scan.
 * @returns Absolute file paths sorted by name.
 */
async function findJsonFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findJsonFiles(entryPath)));
    } else {
      files.push(entryPath);
    }
  }

  return files.sort();
}

/**
 * Compiles an official DTCG JSON Schema.
 *
 * @param schema The parsed JSON Schema.
 * @returns A configured Ajv validation function.
 */
function compile(schema: unknown): ValidateFunction {
  // The official schemas use JSON Schema Draft 7 and bundle their referenced
  // schemas under canonical absolute IDs.
  const ajv = new Ajv({
    allErrors: true,
    strictSchema: true,
    strictTypes: false,
    validateFormats: true,
  });
  addFormats(ajv);
  return ajv.compile(schema as AnySchema);
}

/**
 * Prints Ajv validation errors with file and instance paths.
 *
 * @param file The file that failed validation.
 * @param errors The Ajv validation errors.
 */
function printErrors(file: string, errors?: ErrorObject[] | null): void {
  const relativeFile = path.relative(ROOT_DIRECTORY, file);

  for (const error of errors ?? []) {
    const location = error.instancePath || "/";
    console.error(
      `${relativeFile}${location}: ${error.message} (${error.schemaPath})`,
    );
  }
}

/**
 * Verifies schema checksums and validates every token and resolver file.
 */
async function main(): Promise<void> {
  const manifestPath = path.join(SCHEMA_DIRECTORY, "manifest.json");
  const { value: manifest } = await readJson<Manifest>(manifestPath);
  const validators = {} as Record<SchemaName, ValidateFunction>;

  if (manifest.version !== SCHEMA_VERSION) {
    throw new Error(
      `${path.relative(ROOT_DIRECTORY, manifestPath)} has unexpected schema version ${manifest.version}`,
    );
  }

  for (const name of SCHEMA_NAMES) {
    const schemaPath = path.join(SCHEMA_DIRECTORY, `${name}.json`);
    const { content, value } = await readJson(schemaPath);
    const expectedHash = manifest.schemas?.[name]?.sha256;
    const actualHash = sha256(content);

    if (!expectedHash || actualHash !== expectedHash) {
      throw new Error(
        `${path.relative(ROOT_DIRECTORY, schemaPath)} does not match its manifest checksum; run pnpm tokens:schemas:update from the workspace root`,
      );
    }

    validators[name] = compile(value);
  }

  const jsonFiles = await findJsonFiles(TOKENS_DIRECTORY);
  const tokenFiles: string[] = [];
  const resolverFiles: string[] = [];

  for (const file of jsonFiles) {
    if (file.endsWith(".tokens.json")) {
      tokenFiles.push(file);
    } else if (file.endsWith(".resolver.json")) {
      resolverFiles.push(file);
    }
  }

  if (tokenFiles.length === 0 || resolverFiles.length === 0) {
    throw new Error("Expected at least one token file and one resolver file");
  }

  let valid = true;
  const validationGroups: Array<{
    files: string[];
    validate: ValidateFunction;
  }> = [
    { files: tokenFiles, validate: validators.format },
    { files: resolverFiles, validate: validators.resolver },
  ];

  for (const { files, validate } of validationGroups) {
    for (const file of files) {
      const { value } = await readJson(file);
      if (!validate(value)) {
        valid = false;
        printErrors(file, validate.errors);
      }
    }
  }

  if (!valid) {
    process.exitCode = 1;
    return;
  }

  console.log(
    `Validated ${tokenFiles.length} token files and ${resolverFiles.length} resolver files against DTCG ${manifest.version}.`,
  );
}

/**
 * Reports a fatal token validation error.
 *
 * @param error The error raised by the validation process.
 */
function handleError(error: unknown): void {
  console.error(errorMessage(error));
  process.exitCode = 1;
}

main().catch(handleError);
