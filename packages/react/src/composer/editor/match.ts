// Derived from `packages/core/src/components/trigger-menu/trigger-match.ts` in vercel-labs/ui
// (https://github.com/vercel-labs/ui), Copyright 2026 Vercel, Inc., licensed under the Apache
// License, Version 2.0, and modified. See THIRD-PARTY-NOTICES in this package.
import {CHIP_CHARACTER, type ComposerTextRange} from './model.ts';

/**
 * Where a trigger counts. `word-start`: after whitespace, an opening mark, a chip, an emoji, or a
 * Chinese or Japanese character, since those scripts are written without spaces.
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

// Script_Extensions, not Script: `ー`, `。`, `「」` and `々` count as Han or kana only there. No
// Hangul: Korean uses spaces.
const WORD_START = new RegExp(
  `[\\s\\p{Ps}\\p{Pi}"'\`<${CHIP_CHARACTER}\\p{Extended_Pictographic}\\p{Emoji_Modifier}` +
    `\\p{Regional_Indicator}\\u20E3` +
    `\\p{scx=Han}\\p{scx=Hira}\\p{scx=Kana}\\p{scx=Bopo}\\uFF01-\\uFF65]`,
  'u',
);
// End a query as whitespace does; in text without spaces it would run on through the sentence.
// Only CJK marks: ASCII ones occur in paths and addresses, and `’` is also an apostrophe.
const WORD_END = /[\s、。，．！？：；｡､」』）】〕〉》｣］｝〗〙〛]/u;

const VARIATION_SELECTOR = /[\uFE0E\uFE0F]/;

/** By code point, so a surrogate pair (Ext-B Han, emoji) is one; skips VS15 and VS16. */
function pointBefore(text: string, index: number): string | undefined {
  let end = index;
  if (VARIATION_SELECTOR.test(text[end - 1] ?? '')) end -= 1;
  const low = text.charCodeAt(end - 1);
  const pair = low >= 0xdc00 && low <= 0xdfff && end >= 2;
  return pair ? text.slice(end - 2, end) : text[end - 1];
}

const endsWord = (character: string | undefined): boolean =>
  character !== undefined && (character === CHIP_CHARACTER || WORD_END.test(character));

function at(text: string, index: number, position: ComposerSuggestionPosition): boolean {
  const before = pointBefore(text, index);
  switch (position) {
    case 'start':
      return index === 0;
    case 'line-start':
      return before === undefined || before === '\n';
    case 'word-start':
      return before === undefined || WORD_START.test(before);
    case 'anywhere':
      return true;
  }
}

/**
 * The last trigger in the word that ends at the caret. `before` is the text before the caret, from
 * `offsetText`. Words end at chips and `WORD_END`.
 */
export function findMatch(
  before: string,
  triggers: readonly ComposerSuggestionTrigger[],
): ComposerSuggestionMatch | null {
  let start = before.length;
  while (start > 0 && !endsWord(before[start - 1])) start -= 1;
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
