// Derived from TokenInput in vercel-labs/ui (https://github.com/vercel-labs/ui), Copyright 2026
// Vercel, Inc., licensed under the Apache License, Version 2.0, and modified. See
// THIRD-PARTY-NOTICES in this package.
//
// A value as plain data: strings and atomic chips, with offsets where a chip counts as one, and
// edits by range.

/**
 * Extend the type with your own fields. `id` is unique within a value: a chip repeating an
 * earlier chip's id gets a new one (`${id}-2`, `-3`, …), and so does a pasted or dropped copy of a
 * chip that's still in the text, so the original keeps its id. To reference the same file twice,
 * give each chip its own id; two chips can carry the same path.
 */
export type ComposerChip = {readonly id: string; readonly label: string};

export type ComposerSegment<T extends ComposerChip = ComposerChip> = string | T;

/** Normalized: no adjacent or empty strings. */
export type ComposerValue<T extends ComposerChip = ComposerChip> = readonly ComposerSegment<T>[];

export type ComposerTextRange = {readonly start: number; readonly end: number};

/** Stands for a chip in `offsetText`, so string indices match value offsets. */
export const CHIP_CHARACTER = '\uFFFC';

/** Whether a segment of a value is a chip rather than text. */
export const isChip = <T extends ComposerChip>(
  segment: ComposerSegment<T> | undefined,
): segment is T => segment !== undefined && typeof segment !== 'string';

export const caretAt = (offset: number): ComposerTextRange => ({start: offset, end: offset});

export type RenameChip<T extends ComposerChip> = (chip: T, id: string) => T;

const copyWithId = <T extends ComposerChip>(chip: T, id: string): T => ({...chip, id});

/**
 * The first of `${id}-2`, `-3`, … that isn't taken. Deterministic, so the same value always gets
 * the same ids.
 */
function nextId(id: string, taken: ReadonlySet<string>): string {
  let count = 2;
  while (taken.has(`${id}-${count}`)) count += 1;
  return `${id}-${count}`;
}

/** Merges adjacent strings, drops empty ones and renames repeated ids; chips keep identity. */
export function normalize<T extends ComposerChip>(
  segments: readonly ComposerSegment<T>[],
  rename: RenameChip<T> = copyWithId,
): ComposerValue<T> {
  const taken = new Set(segments.filter(isChip).map((chip) => chip.id));
  const seen = new Set<string>();
  const result: ComposerSegment<T>[] = [];
  for (const segment of segments) {
    if (isChip(segment)) {
      let chip = segment;
      if (seen.has(chip.id)) {
        const id = nextId(chip.id, taken);
        taken.add(id);
        chip = rename(chip, id);
      }
      seen.add(chip.id);
      result.push(chip);
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

/**
 * `content` to put into `value`, with new ids for its chips that `value` already has: a copy
 * placed before its original must not take the original's id.
 */
export function withNewIds<T extends ComposerChip>(
  content: readonly ComposerSegment<T>[],
  value: ComposerValue<T>,
): ComposerSegment<T>[] {
  const inValue = new Set(chipsOf(value).map((chip) => chip.id));
  const taken = new Set([...inValue, ...content.filter(isChip).map((chip) => chip.id)]);
  return content.map((segment) => {
    if (!isChip(segment) || !inValue.has(segment.id)) return segment;
    const id = nextId(segment.id, taken);
    taken.add(id);
    return copyWithId(segment, id);
  });
}

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

/** Compares chips by id, so a value and one with copies of its chips are the same text. */
export const sameContent = <T extends ComposerChip>(
  a: ComposerValue<T>,
  b: ComposerValue<T>,
): boolean =>
  a.length === b.length &&
  a.every((segment, index) => {
    const other = b[index];
    return isChip(segment) ? isChip(other) && other.id === segment.id : segment === other;
  });

/** The value as text, with each chip written as `chipToText` gives it. */
export const valueToText = <T extends ComposerChip>(
  value: ComposerValue<T>,
  chipToText: (chip: T) => string,
): string => value.map((segment) => (isChip(segment) ? chipToText(segment) : segment)).join('');
