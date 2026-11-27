// Derived from `packages/core/src/components/trigger-menu/trigger-match.ts` in vercel-labs/ui
// (https://github.com/vercel-labs/ui), Copyright 2026 Vercel, Inc., licensed under the Apache
// License, Version 2.0, and modified. See THIRD-PARTY-NOTICES in this package.
import {CHIP_CHARACTER, type ComposerTextRange} from './model.ts';

/**
 * Where a trigger counts. `word-start`: after whitespace, an opening mark, `,`, `;`, `!` or `?`, a
 * chip, an emoji, or a Chinese or Japanese character, since those scripts are written without spaces.
 */
export type ComposerSuggestionPosition = 'start' | 'line-start' | 'word-start' | 'anywhere';

export type ComposerSuggestionTrigger = {
  /** Also matches its full-width form, such as `＠` for `@`. */
  readonly character: string;
  /** Defaults to `word-start`. */
  readonly position?: ComposerSuggestionPosition | undefined;
  // Counts spaces, not words as vercel-labs/ui's `spaces` does: `1` allows `Mary Ann`.
  /**
   * How many single spaces the query may hold, a whole number such as `2` for `@Mary Ann Lee`, or
   * `true` for any number. Defaults to `false`.
   */
  readonly spaces?: boolean | number | undefined;
};

export type ComposerSuggestionMatch = {
  /** The configured trigger, also when its full-width form was typed; the text has the typed one. */
  readonly character: string;
  /** The text between the trigger and the caret. */
  readonly query: string;
  /** Covers the trigger and the query. */
  readonly range: ComposerTextRange;
};

/**
 * Scripts written without spaces, with their punctuation and full-width forms, as the body of a
 * character class. Script_Extensions, not Script: `ー`, `。`, `「」` and `々` count as Han or kana
 * only there. No Hangul: Korean uses spaces.
 */
export const UNSPACED_SCRIPT = '\\p{scx=Han}\\p{scx=Hira}\\p{scx=Kana}\\p{scx=Bopo}\\uFF01-\\uFF65';

/**
 * What a check by code point finds at either end of an emoji, as the body of a character class:
 * the pictograph, a skin tone, a flag's regional indicator or tag, or a keycap's mark.
 */
export const EMOJI =
  '\\p{Extended_Pictographic}\\p{Emoji_Modifier}\\p{Regional_Indicator}\\u20E3\\u{E0020}-\\u{E007F}';

const WORD_START = new RegExp(
  `[\\s\\p{Ps}\\p{Pi}"'\`<,;!?${CHIP_CHARACTER}${EMOJI}${UNSPACED_SCRIPT}]`,
  'u',
);
// End a query as whitespace does, such as `@sam,` at the comma; in text without spaces it would
// otherwise run on through the sentence. Not `.`, `-`, `_`, `/`, `\`, `~`, `+`, `=`, `@`, `#` or
// apostrophes: they occur in paths and names, such as `@~/a+b.ts` and `@O'Brien`, and a `.` may
// end a sentence or start a file extension. ASCII closing brackets end it in `endsQuery`.
const WORD_END = /[\s,;:!?"、。，．！？：；｡､」』）】〕〉》｣］｝〗〙〛]/u;

const OPENERS = '([{';
const CLOSERS = ')]}';

/**
 * Whether a closing bracket ends `query`: one without an opener of its type before it, as in
 * `(@sam)`, while `@app/(marketing)/page.tsx` stays one query. Each type counts on its own.
 */
function endsQuery(query: string): boolean {
  const open = [0, 0, 0];
  for (const character of query) {
    const opener = OPENERS.indexOf(character);
    if (opener >= 0) open[opener] = (open[opener] ?? 0) + 1;
    const closer = CLOSERS.indexOf(character);
    if (closer < 0) continue;
    if (!open[closer]) return true;
    open[closer] -= 1;
  }
  return false;
}

const VARIATION_SELECTOR = /[\uFE0E\uFE0F]/;

/** By code point, so a surrogate pair (Ext-B Han, emoji) is one; skips VS15 and VS16. */
export function pointBefore(text: string, index: number): string | undefined {
  let end = index;
  if (VARIATION_SELECTOR.test(text[end - 1] ?? '')) end -= 1;
  const low = text.charCodeAt(end - 1);
  const pair = low >= 0xdc00 && low <= 0xdfff && end >= 2;
  return pair ? text.slice(end - 2, end) : text[end - 1];
}

const endsWord = (character: string | undefined): boolean =>
  character !== undefined && (character === CHIP_CHARACTER || WORD_END.test(character));

const FULL_WIDTH = /[\uFF01-\uFF5E]/g;

/**
 * Full-width ASCII (U+FF01–FF5E) as ASCII, so a Japanese or Chinese keyboard's `＠` matches `@`.
 * By offset rather than NFKC, which can change the length and so the offsets.
 */
const halfWidth = (text: string): string =>
  text.replace(FULL_WIDTH, (character) => String.fromCharCode(character.charCodeAt(0) - 0xfee0));

/** Whether `text` still has the trigger `character`, in either width, at `index`. */
export const hasTrigger = (text: string, index: number, character: string): boolean =>
  halfWidth(text.slice(index, index + character.length)) === halfWidth(character);

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
 * How far back from the caret a query holding a space reaches, its trigger included. Fits names of
 * several parts, such as `@María José García Fernández`, while a sentence typed after a trigger
 * stops being searched within about ten words; it also bounds the walk back.
 */
const SPACED_REACH = 64;

/**
 * Where a query ending at the caret may start: the word start `start`, or an earlier word start
 * across up to `limit` single spaces, within `SPACED_REACH`.
 */
function queryStart(before: string, start: number, limit: number): number {
  const floor = Math.max(0, before.length - SPACED_REACH);
  let reach = start;
  let gaps = 0;
  // Two spaces in a row, or `. ` at the end of a sentence, end the query.
  while (
    gaps < limit &&
    before[reach - 1] === ' ' &&
    before[reach - 2] !== ' ' &&
    before[reach - 2] !== '.'
  ) {
    let next = reach - 1;
    while (next > floor && !endsWord(before[next - 1])) next -= 1;
    if (next < floor || (next > 0 && !endsWord(before[next - 1]))) break;
    reach = next;
    gaps += 1;
  }
  return reach;
}

/**
 * The trigger nearest the caret, at its position, in the word that ends at the caret, or across
 * single spaces for a trigger with `spaces`. `before` is the text before the caret, from
 * `offsetText`. Words end at chips and `WORD_END`; a query also ends at a closing bracket it didn't
 * open.
 */
export function findMatch(
  before: string,
  triggers: readonly ComposerSuggestionTrigger[],
): ComposerSuggestionMatch | null {
  let start = before.length;
  while (start > 0 && !endsWord(before[start - 1])) start -= 1;
  const reaching = triggers.map(({character, position = 'word-start', spaces = false}) => ({
    character,
    position,
    reach: queryStart(before, start, spaces === true ? Number.POSITIVE_INFINITY : spaces || 0),
  }));
  // Every trigger is searched as far back as the farthest reach, so the nearest one owns the
  // query: `#` in `@sam #tag x` ends `@`'s query, though `#` alone takes no spaces.
  const farthest = Math.min(start, ...reaching.map(({reach}) => reach));
  let owner: ((typeof reaching)[number] & {readonly index: number}) | undefined;
  for (const trigger of reaching) {
    const {character, position} = trigger;
    // The backward scan stops after a trigger that is itself an ending character, such as `:`, so
    // the search starts one trigger length earlier.
    const from = Math.max(0, farthest - character.length);
    // The boundary check reads the text as typed; only the trigger's search is folded.
    const text = halfWidth(before.slice(from));
    const folded = halfWidth(character);
    for (
      let index = text.lastIndexOf(folded) + from;
      index >= from;
      index = index > from ? text.lastIndexOf(folded, index - from - 1) + from : -1
    ) {
      if (!at(before, index, position)) continue;
      if (!owner || index > owner.index) owner = {...trigger, index};
      break;
    }
  }
  if (!owner) return null;
  const {character, index, reach} = owner;
  const query = before.slice(index + character.length);
  // Too many spaces for this trigger, a space right after it, as in `@ home`, or a closer end its
  // query; an earlier trigger doesn't take it over.
  if (index < reach - character.length || query.startsWith(' ') || endsQuery(query)) return null;
  return {character, query, range: {start: index, end: before.length}};
}
