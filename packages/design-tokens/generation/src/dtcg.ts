import type {DtcgToken, GenerationMarker, JsonObject, JsonValue} from './types';

export const FORMAT_SCHEMA = 'https://designtokens.org/schemas/2025.10/format.json';
export const GENERATED_DESCRIPTION =
  'Contains generated and manually authored tokens. Edit only paths not managed by a generator.';
export const GENERATION_EXTENSION_KEY = 'com.earendil-works.generation';

/**
 * Creates a DTCG token object.
 *
 * @param value The token value payload.
 * @returns A token object with `$value` set.
 */
export function token(value: JsonValue): JsonObject {
  return {$value: value};
}

/**
 * Rounds a number to a fixed decimal precision.
 *
 * @param value The input number.
 * @param precision The number of decimal places to keep.
 * @returns The rounded number.
 */
export function round(value: number, precision: number): number {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Deep-clones a JSON-compatible value.
 *
 * @param value The value to clone.
 * @returns A structural clone.
 */
export function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Parses a JSON document into a JSON value.
 *
 * @param source The JSON text.
 * @param label The file or document label used in parse errors.
 * @returns The parsed JSON value.
 */
export function parseJson(source: string, label: string): JsonValue {
  try {
    return JSON.parse(source);
  } catch (cause) {
    throw new Error(`${label}: ${errorMessage(cause)}`);
  }
}

/**
 * Converts an unknown error into display text.
 *
 * @param cause The thrown value.
 * @returns A readable error message.
 */
function errorMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

/**
 * Checks whether a JSON value is a plain object.
 *
 * @param value The JSON value to test.
 * @returns Whether the value is a plain object.
 */
export function isJsonObject(value: JsonValue): value is JsonObject {
  return value instanceof Object && !Array.isArray(value);
}

/**
 * Checks whether a JSON value is a DTCG token node.
 *
 * @param value The JSON value to test.
 * @returns Whether the value is a token object with `$value`.
 */
export function isToken(value: JsonValue): value is DtcgToken {
  return isJsonObject(value) && Object.hasOwn(value, '$value');
}

/**
 * Adds generation ownership metadata to every token leaf in a subtree.
 *
 * @param value The generated subtree.
 * @param marker The ownership marker to stamp onto each token.
 * @returns A cloned and stamped subtree.
 */
export function stampGeneratedTokens(value: JsonObject, marker: GenerationMarker): JsonObject {
  const stamped = cloneJson(value);
  stampNode(stamped, marker);
  return stamped;
}

function stampNode(node: JsonValue, marker: GenerationMarker): void {
  if (!isJsonObject(node)) {
    return;
  }

  if (isToken(node)) {
    const extensions = isJsonObject(node.$extensions) ? node.$extensions : {};
    node.$extensions = {
      ...extensions,
      [GENERATION_EXTENSION_KEY]: marker,
    };
    return;
  }

  for (const [key, child] of Object.entries(node)) {
    if (!key.startsWith('$') || key === '$root') {
      stampNode(child, marker);
    }
  }
}
