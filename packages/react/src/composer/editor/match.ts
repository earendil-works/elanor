import {CHIP_CHARACTER, type ComposerTextRange} from './model.ts';

/**
 * Where a trigger counts. `word-start`: after whitespace, an opening bracket or quotation mark, or
 * a chip.
 */
export type ComposerSuggestionPosition = 'start' | 'line-start' | 'word-start' | 'anywhere';

export type ComposerSuggestionTrigger = {
  readonly character: string;
  /** Defaults to `word-start`. */
  readonly position?: ComposerSuggestionPosition | undefined;
};

export type ComposerSuggestionMatch = {
  readonly character: string;
  /** The text between the trigger and the caret. */
  readonly query: string;
  /** Covers the trigger and the query. */
  readonly range: ComposerTextRange;
};

const OPENING = new Set(['(', '[', '{', '<', '"', "'", '`', '“', '‘', '«', CHIP_CHARACTER]);

function at(text: string, index: number, position: ComposerSuggestionPosition): boolean {
  const before = text[index - 1];
  switch (position) {
    case 'start':
      return index === 0;
    case 'line-start':
      return before === undefined || before === '\n';
    case 'word-start':
      return before === undefined || /\s/.test(before) || OPENING.has(before);
    case 'anywhere':
      return true;
  }
}

/**
 * The last trigger in the word that ends at the caret. `before` is the text before the caret, from
 * `offsetText`. Words end at whitespace and chips.
 */
export function findMatch(
  before: string,
  triggers: readonly ComposerSuggestionTrigger[],
): ComposerSuggestionMatch | null {
  let start = before.length;
  while (start > 0 && !/\s/.test(before[start - 1] ?? '') && before[start - 1] !== CHIP_CHARACTER)
    start -= 1;
  let found: ComposerSuggestionMatch | null = null;
  for (const {character, position = 'word-start'} of triggers) {
    for (
      let index = before.lastIndexOf(character);
      index >= start;
      index = index > 0 ? before.lastIndexOf(character, index - 1) : -1
    ) {
      if (!at(before, index, position)) continue;
      if (!found || index > found.range.start)
        found = {
          character,
          query: before.slice(index + character.length),
          range: {start: index, end: before.length},
        };
      break;
    }
  }
  return found;
}
