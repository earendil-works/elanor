#!/usr/bin/env node

import {createHash} from 'node:crypto';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';

const VERSION = '2025.10';
const SCHEMA_DIRECTORY = path.join(__dirname, '..', 'schemas', 'dtcg', VERSION);
const SCHEMA_NAMES = ['format', 'resolver'] as const;

type SchemaName = (typeof SCHEMA_NAMES)[number];

interface DownloadedSchema {
  name: SchemaName;
  url: string;
  content: Buffer;
  sha256: string;
}

interface SchemaMetadata {
  $id?: unknown;
  $schema?: unknown;
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
 * Builds the official URL for a DTCG schema.
 *
 * @param name The schema name.
 * @returns The schema URL for the configured DTCG version.
 */
function schemaUrl(name: SchemaName): string {
  return `https://designtokens.org/schemas/${VERSION}/${name}.json`;
}

/**
 * Calculates the SHA-256 digest of file content.
 *
 * @param content The file content.
 * @returns A lowercase hexadecimal digest.
 */
function sha256(content: Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Downloads and verifies one official DTCG schema.
 *
 * @param name The schema name.
 * @returns The verified schema and its metadata.
 * @throws When the response is invalid or has unexpected metadata.
 */
async function downloadSchema(name: SchemaName): Promise<DownloadedSchema> {
  const url = schemaUrl(name);
  const response = await fetch(url, {
    headers: {'user-agent': 'design-tokens-schema-updater'},
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Could not download ${url}: HTTP ${response.status}`);
  }

  const content = Buffer.from(await response.arrayBuffer());
  let schema: SchemaMetadata;

  try {
    schema = JSON.parse(content.toString('utf8')) as SchemaMetadata;
  } catch (error) {
    throw new Error(`${url} did not return valid JSON: ${errorMessage(error)}`);
  }

  if (
    schema.$schema !== 'http://json-schema.org/draft-07/schema#' ||
    typeof schema.$id !== 'string' ||
    !schema.$id.includes(`/schemas/${VERSION}/`)
  ) {
    throw new Error(`${url} did not return the expected DTCG ${VERSION} schema`);
  }

  return {name, url, content, sha256: sha256(content)};
}

/**
 * Updates all vendored schemas and writes their checksum manifest.
 */
async function main(): Promise<void> {
  // Download and validate everything before changing the vendored copies.
  const schemas = await Promise.all(SCHEMA_NAMES.map(downloadSchema));
  await mkdir(SCHEMA_DIRECTORY, {recursive: true});

  for (const schema of schemas) {
    await writeFile(path.join(SCHEMA_DIRECTORY, `${schema.name}.json`), schema.content);
  }

  const manifestSchemas: Record<SchemaName, {url: string; sha256: string}> = {} as Record<
    SchemaName,
    {url: string; sha256: string}
  >;
  for (const {name, url, sha256: digest} of schemas) {
    manifestSchemas[name] = {url, sha256: digest};
  }

  const manifest = {
    version: VERSION,
    schemas: manifestSchemas,
  };

  // Write the checksum manifest last so an interrupted update fails validation.
  await writeFile(
    path.join(SCHEMA_DIRECTORY, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  for (const schema of schemas) {
    console.log(
      `Updated ${path.relative(process.cwd(), path.join(SCHEMA_DIRECTORY, `${schema.name}.json`))} (${schema.sha256})`,
    );
  }
}

/**
 * Reports a fatal schema update error.
 *
 * @param error The error raised by the update process.
 */
function handleError(error: unknown): void {
  console.error(errorMessage(error));
  process.exitCode = 1;
}

main().catch(handleError);
