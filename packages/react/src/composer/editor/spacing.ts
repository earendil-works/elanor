import {EMOJI, UNSPACED_SCRIPT, pointBefore} from './match.ts';
import {
  CHIP_CHARACTER,
  isChip,
  offsetText,
  sliceValue,
  type ComposerChip,
  type ComposerSegment,
  type ComposerTextRange,
  type ComposerValue,
} from './model.ts';

// Scripts that don't space words get no space beside an insert. Thai, Lao, Khmer and Myanmar only
// here: `match.ts`'s word starts don't need them.
const UNSPACED = new RegExp(
  `[${UNSPACED_SCRIPT}\\p{scx=Thai}\\p{scx=Laoo}\\p{scx=Khmr}\\p{scx=Mymr}]`,
  'u',
);
/** Marks that follow a word without a space, closing quotes and brackets included. */
const CLOSING = /[\p{Pe}\p{Pf}.,!?:;…'"%]/u;
const OPENING = /[\p{Ps}\p{Pi}]/u;
const WORD = /[\p{L}\p{N}]/u;
const WORD_OR_EMOJI = new RegExp(`[\\p{L}\\p{N}${EMOJI}]`, 'u');
const SPACE = /\s/u;
/** Only spaces and tabs are added or trimmed: a line break is the text's. */
const HORIZONTAL = /[ \t]/;
const BLANK = /^[ \t]+$/;
const MARK = /\p{M}/u;
// German quotes open with `„` and `‚`, and close with the `“` and `‘` that open English ones.
const LOW_QUOTES = new Map([
  ['“', '„'],
  ['‘', '‚'],
]);

/** Whether `mark` after `text` closes a German quote that `text` opened. */
function closesLow(text: string, mark: string): boolean {
  const opening = LOW_QUOTES.get(mark);
  return opening !== undefined && text.lastIndexOf(opening) > text.lastIndexOf(mark);
}

/** Whether `previous`, the last character of `left` past its marks, is spaced from a word after it. */
function endsWord(left: string, previous: string): boolean {
  if (previous === CHIP_CHARACTER || WORD_OR_EMOJI.test(previous)) return true;
  const head = left.slice(0, left.lastIndexOf(previous));
  // A straight quote here opens at the start, after a space or after an opening mark, as smart
  // quotes read it; anywhere else it closes.
  if (previous === '"' || previous === "'") {
    const before = baseBefore(head, head.length);
    return before !== undefined && !SPACE.test(before) && !OPENING.test(before);
  }
  return CLOSING.test(previous) || closesLow(head, previous);
}

/**
 * Whether a space goes between `left` and `right`, the text on either side of an insert's edge,
 * with chips as `CHIP_CHARACTER`. Never beside whitespace or a script written without spaces.
 */
function spaced(left: string, right: string): boolean {
  const previous = baseBefore(left, left.length);
  const next = firstPoint(right);
  if (previous === undefined || next === undefined) return false;
  if ([previous, next].some((point) => SPACE.test(point) || UNSPACED.test(point))) return false;
  if (!endsWord(left, previous)) return false;
  // A `"` after the edge opens before a word. A `'` there closes: it is an apostrophe, as in
  // `@file's`.
  if (next === '"') return WORD.test(firstPoint(right.slice(1)) ?? '');
  if (CLOSING.test(next) || closesLow(left, next)) return false;
  // After a chip anything else is spaced, such as `@file -v`.
  return (
    previous === CHIP_CHARACTER ||
    next === CHIP_CHARACTER ||
    WORD_OR_EMOJI.test(next) ||
    OPENING.test(next)
  );
}

/** The character before `index`, past the combining marks that belong to it. */
function baseBefore(text: string, index: number): string | undefined {
  let end = index;
  let point = pointBefore(text, end);
  while (point !== undefined && MARK.test(point)) {
    end -= point.length;
    point = pointBefore(text, end);
  }
  return point;
}

const isBlank = (segment: ComposerSegment<ComposerChip> | undefined): boolean =>
  segment !== undefined && !isChip(segment) && BLANK.test(segment);

const firstPoint = (text: string): string | undefined => {
  const point = text.codePointAt(0);
  return point === undefined ? undefined : String.fromCodePoint(point);
};

/**
 * `content` to put at `range` of `value`, with one space between two chips and a space at either
 * edge where the text needs one: before a chip, a word, an emoji or an opening mark that follows a
 * chip, a word, an emoji or a closing mark; and after a chip unless whitespace or a closing mark
 * follows, also at the end. Spaces in `content` count, so none doubles; line breaks stay. In
 * logical order, also for right-to-left text.
 */
export function withSpaces<T extends ComposerChip>(
  value: ComposerValue<T>,
  range: ComposerTextRange,
  content: readonly ComposerSegment<T>[],
): ComposerSegment<T>[] {
  const given = [...content];
  // A space the caller put beside a chip at either end is dropped; the rule below decides it.
  if (isChip(given.at(-2)) && isBlank(given.at(-1))) given.pop();
  if (isChip(given[1]) && isBlank(given[0])) given.shift();
  const result: ComposerSegment<T>[] = [];
  for (const segment of given) {
    if (isChip(segment) && isChip(result.at(-1))) result.push(' ');
    result.push(segment);
  }
  const before = offsetText(sliceValue(value, 0, range.start));
  const after = offsetText(sliceValue(value, range.end));
  const previous = baseBefore(before, before.length);
  const first = result[0];
  const last = result.at(-1);
  // Text at either end keeps its spaces unless one would double.
  if (
    last !== undefined &&
    !isChip(last) &&
    HORIZONTAL.test(last.at(-1) ?? '') &&
    HORIZONTAL.test(after[0] ?? '')
  )
    result[result.length - 1] = last.slice(0, -1);
  if (
    first !== undefined &&
    !isChip(first) &&
    HORIZONTAL.test(first[0] ?? '') &&
    (previous === undefined || HORIZONTAL.test(previous))
  )
    result[0] = first.slice(1);
  const text = offsetText(result);
  if (text === '') return result;
  if ((isChip(last) && after === '') || spaced(before + text, after)) result.push(' ');
  if (spaced(before, text + after)) result.unshift(' ');
  return result;
}
