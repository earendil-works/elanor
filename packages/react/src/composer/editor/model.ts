// Derived from TokenInput in vercel-labs/ui (https://github.com/vercel-labs/ui), Copyright 2026
// Vercel, Inc., licensed under the Apache License, Version 2.0, and modified. See
// THIRD-PARTY-NOTICES in this package.
//
// A value as plain data: strings and atomic chips, with offsets where a chip counts as one, and
// edits by range.

/** `id` is unique within a value. Apps extend the type with their own fields. */
export type ComposerChip = {readonly id: string; readonly label: string};

export type ComposerSegment<T extends ComposerChip> = string | T;

/** Normalized: no adjacent or empty strings. */
export type ComposerValue<T extends ComposerChip> = readonly ComposerSegment<T>[];

export type ComposerTextRange = {readonly start: number; readonly end: number};

/** Stands for a chip in `offsetText`, so string indices match value offsets. */
export const CHIP_CHARACTER = '\uFFFC';

export const isChip = <T extends ComposerChip>(
  segment: ComposerSegment<T> | undefined,
): segment is T => segment !== undefined && typeof segment !== 'string';

export const caretAt = (offset: number): ComposerTextRange => ({start: offset, end: offset});

/** Merges adjacent strings, drops empty ones, and drops chips whose id already appeared. */
export function normalize<T extends ComposerChip>(
  segments: readonly ComposerSegment<T>[],
): ComposerValue<T> {
  const result: ComposerSegment<T>[] = [];
  const ids = new Set<string>();
  for (const segment of segments) {
    if (isChip(segment)) {
      if (ids.has(segment.id)) continue;
      ids.add(segment.id);
      result.push(segment);
      continue;
    }
    if (!segment) continue;
    const last = result.at(-1);
    if (last !== undefined && !isChip(last)) result[result.length - 1] = last + segment;
    else result.push(segment);
  }
  return result;
}

const lengthOf = <T extends ComposerChip>(segment: ComposerSegment<T>): number =>
  isChip(segment) ? 1 : segment.length;

export const valueLength = <T extends ComposerChip>(value: ComposerValue<T>): number =>
  value.reduce((total, segment) => total + lengthOf(segment), 0);

export const offsetText = <T extends ComposerChip>(value: ComposerValue<T>): string =>
  value.map((segment) => (isChip(segment) ? CHIP_CHARACTER : segment)).join('');

export function sliceValue<T extends ComposerChip>(
  value: ComposerValue<T>,
  start: number,
  end = Number.POSITIVE_INFINITY,
) {
  const result: ComposerSegment<T>[] = [];
  let at = 0;
  for (const segment of value) {
    const length = lengthOf(segment);
    const from = Math.max(start - at, 0);
    const to = Math.min(end - at, length);
    if (from < to) result.push(isChip(segment) ? segment : segment.slice(from, to));
    at += length;
    if (at >= end) break;
  }
  return result;
}

export const replaceRange = <T extends ComposerChip>(
  value: ComposerValue<T>,
  range: ComposerTextRange,
  content: readonly ComposerSegment<T>[],
): ComposerValue<T> =>
  normalize([...sliceValue(value, 0, range.start), ...content, ...sliceValue(value, range.end)]);

export function chipAt<T extends ComposerChip>(
  value: ComposerValue<T>,
  offset: number,
): T | undefined {
  const [segment] = sliceValue(value, offset, offset + 1);
  return isChip(segment) ? segment : undefined;
}

export function offsetOfChip<T extends ComposerChip>(
  value: ComposerValue<T>,
  id: string,
): number | undefined {
  let at = 0;
  for (const segment of value) {
    if (isChip(segment) && segment.id === id) return at;
    at += lengthOf(segment);
  }
  return undefined;
}

export const chipsOf = <T extends ComposerChip>(value: ComposerValue<T>): T[] =>
  value.filter(isChip);

export function removedChips<T extends ComposerChip>(
  before: ComposerValue<T>,
  after: ComposerValue<T>,
): T[] {
  const kept = new Set(chipsOf(after).map((chip) => chip.id));
  return chipsOf(before).filter((chip) => !kept.has(chip.id));
}

/** Compares chips by identity: to change a chip, replace the object. */
export const sameValue = <T extends ComposerChip>(
  a: ComposerValue<T>,
  b: ComposerValue<T>,
): boolean => a.length === b.length && a.every((segment, index) => segment === b[index]);

export const toText = <T extends ComposerChip>(
  value: ComposerValue<T>,
  chipToText: (chip: T) => string,
): string => value.map((segment) => (isChip(segment) ? chipToText(segment) : segment)).join('');
