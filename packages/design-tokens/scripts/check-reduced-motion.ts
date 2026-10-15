#!/usr/bin/env node

import {readFile} from 'node:fs/promises';
import path from 'node:path';

import {isJsonObject, isToken, parseJson} from '../generation/src/dtcg';
import type {JsonObject, JsonValue} from '../generation/src/types';

const ROOT_DIRECTORY = path.join(__dirname, '..');
const SEMANTIC_DIRECTORY = path.join(ROOT_DIRECTORY, 'tokens', 'shared', 'semantic');
const DEFAULT_FILE = path.join(SEMANTIC_DIRECTORY, 'transition.tokens.json');
const REDUCED_FILE = path.join(SEMANTIC_DIRECTORY, 'transition', 'reduced.tokens.json');
const INSTANT_DURATION = '{primitive.duration.0}';

/**
 * Collects transition token values by path.
 *
 * @param node The JSON node to walk.
 * @param tokenPath The path of the node.
 * @returns Each token's `$value` by dot-separated path.
 */
function transitionValues(node: JsonValue, tokenPath: string[]): Map<string, JsonObject> {
  const values = new Map<string, JsonObject>();
  if (!isJsonObject(node)) return values;
  if (isToken(node)) {
    if (!isJsonObject(node.$value))
      throw new Error(`${tokenPath.join('.')} has no transition value.`);
    values.set(tokenPath.join('.'), node.$value);
    return values;
  }
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$') && key !== '$root') continue;
    for (const [childPath, value] of transitionValues(child, [...tokenPath, key]))
      values.set(childPath, value);
  }
  return values;
}

async function readTransitions(file: string): Promise<Map<string, JsonObject>> {
  const label = path.relative(ROOT_DIRECTORY, file);
  const document = parseJson(await readFile(file, 'utf8'), label);
  const semantic = isJsonObject(document) ? document.semantic : undefined;
  const transition = isJsonObject(semantic ?? null)
    ? (semantic as JsonObject).transition
    : undefined;
  return transitionValues(transition ?? {}, ['semantic', 'transition']);
}

/**
 * Checks that the reduced-motion file restates exactly the movement
 * transitions, each instant and otherwise unchanged.
 */
async function main(): Promise<void> {
  const defaults = await readTransitions(DEFAULT_FILE);
  const reduced = await readTransitions(REDUCED_FILE);
  const movement = [...defaults.keys()].filter((tokenPath) =>
    tokenPath.startsWith('semantic.transition.movement.'),
  );
  const problems: string[] = [];

  for (const tokenPath of movement) {
    const base = defaults.get(tokenPath)!;
    const instant = reduced.get(tokenPath);
    if (!instant) {
      problems.push(`${tokenPath} is missing from the reduced-motion file.`);
      continue;
    }
    if (instant.duration !== INSTANT_DURATION)
      problems.push(`${tokenPath} must have duration ${INSTANT_DURATION} when motion is reduced.`);
    for (const part of ['delay', 'timingFunction'])
      if (JSON.stringify(instant[part]) !== JSON.stringify(base[part]))
        problems.push(`${tokenPath} must keep its ${part} when motion is reduced.`);
  }
  for (const tokenPath of reduced.keys())
    if (!movement.includes(tokenPath))
      problems.push(`${tokenPath} in the reduced-motion file is not a movement transition.`);

  if (problems.length > 0) throw new Error(problems.join('\n'));
  console.log(`Checked ${movement.length} reduced-motion transitions.`);
}

void main();
