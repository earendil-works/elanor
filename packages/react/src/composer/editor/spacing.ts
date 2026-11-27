import {UNSPACED_SCRIPT, pointBefore} from './match.ts';
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

// Scripts that don't space words get no space beside a chip. Thai, Lao, Khmer and Myanmar only
// here: `match.ts`'s word starts don't need them.
const UNSPACED = new RegExp(
  `[${UNSPACED_SCRIPT}\\p{scx=Thai}\\p{scx=Laoo}\\p{scx=Khmr}\\p{scx=Mymr}]`,
  'u',
);
/** Marks that follow a word without a space, closing quotes and brackets included. */
const CLOSING = /[\p{Pe}\p{Pf}.,!?:;…'"%]/u;
const OPENING = /[\p{Ps}\p{Pi}]/u;
const WORD = /[\p{L}\p{N}]/u;
const SPACE = /\s/u;
/** Only spaces and tabs are added or trimmed: a line break is the text's. */
const HORIZONTAL = /[ \t]/;
const BLANK = /^[ \t]+$/;
const MARK = /\p{M}/u;

const spaceAfter = (next: string | undefined): boolean =>
  next === undefined || !(SPACE.test(next) || CLOSING.test(next) || UNSPACED.test(next));

/** Whether a chip after `text`, whose last character is `previous`, gets a space before it. */
function spaceBefore(text: string, previous: string | undefined): boolean {
  if (previous === undefined || SPACE.test(previous) || UNSPACED.test(previous)) return false;
  if (previous === CHIP_CHARACTER || WORD.test(previous)) return true;
  // A straight quote opens at the start, after a space or after an opening mark, as smart quotes
  // read it; anywhere else it closes.
  if (previous === '"' || previous === "'") {
    const before = baseBefore(text, text.lastIndexOf(previous));
    return before !== undefined && !SPACE.test(before) && !OPENING.test(before);
  }
  return CLOSING.test(previous);
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
 * `content` to put at `range` of `value`, with one space between two chips, after a chip unless
 * whitespace, a closing mark or an unspaced script follows, and before one that follows a chip or a
 * letter, digit or closing mark of a spaced script. Spaces in `content` count, so none doubles; line
 * breaks stay. In logical order, also for right-to-left text.
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
  const spaced: ComposerSegment<T>[] = [];
  for (const segment of given) {
    if (isChip(segment) && isChip(spaced.at(-1))) spaced.push(' ');
    spaced.push(segment);
  }
  const before = offsetText(sliceValue(value, 0, range.start));
  const previous = baseBefore(before, range.start);
  const next = firstPoint(offsetText(sliceValue(value, range.end)));
  const first = spaced[0];
  const last = spaced.at(-1);
  // Text at either end keeps its spaces unless one would double.
  if (isChip(last)) {
    if (spaceAfter(next)) spaced.push(' ');
  } else if (
    last !== undefined &&
    HORIZONTAL.test(last.at(-1) ?? '') &&
    HORIZONTAL.test(next ?? '')
  )
    spaced[spaced.length - 1] = last.slice(0, -1);
  if (isChip(first)) {
    if (spaceBefore(before, previous)) spaced.unshift(' ');
  } else if (
    first !== undefined &&
    HORIZONTAL.test(first[0] ?? '') &&
    (previous === undefined || HORIZONTAL.test(previous))
  )
    spaced[0] = first.slice(1);
  return spaced;
}
