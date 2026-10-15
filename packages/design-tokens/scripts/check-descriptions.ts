#!/usr/bin/env node

import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';

import {isJsonObject, isToken, parseJson} from '../generation/src/dtcg';
import type {JsonValue} from '../generation/src/types';

const ROOT_DIRECTORY = path.join(__dirname, '..');
const TOKENS_DIRECTORY = path.join(ROOT_DIRECTORY, 'tokens');

/**
 * Lists semantic token paths without a non-empty `$description`.
 *
 * @param node The JSON node to walk.
 * @param tokenPath The path of the node.
 * @returns The token paths missing a description.
 */
function undescribedTokens(node: JsonValue, tokenPath: string[]): string[] {
  if (!isJsonObject(node)) return [];
  if (isToken(node)) {
    const description = node.$description;
    return typeof description === 'string' && description.trim() ? [] : [tokenPath.join('.')];
  }
  return Object.entries(node).flatMap(([key, child]) =>
    key.startsWith('$') && key !== '$root' ? [] : undescribedTokens(child, [...tokenPath, key]),
  );
}

/** Checks that every semantic token says when to use it (see `docs/token-descriptions.md`). */
async function main(): Promise<void> {
  const files = (await readdir(TOKENS_DIRECTORY, {recursive: true}))
    .filter((file) => file.endsWith('.tokens.json'))
    .sort();
  const missing: string[] = [];
  for (const file of files) {
    const document = parseJson(await readFile(path.join(TOKENS_DIRECTORY, file), 'utf8'), file);
    if (!isJsonObject(document)) continue;
    for (const tokenPath of undescribedTokens(document.semantic ?? {}, ['semantic']))
      missing.push(`${file}: ${tokenPath}`);
  }
  if (missing.length > 0)
    throw new Error(`Semantic tokens without a $description:\n${missing.join('\n')}`);
  console.log(`Checked semantic token descriptions in ${files.length} files.`);
}

void main();
