/*
 * Wording that agents misread: stand-ins for the developer, curly quotes, and first paragraphs
 * too long for an `llms.txt` line. `scripts/check-wording.ts` runs it on the sources from
 * `pnpm check`.
 */

const standIn =
  /\b(?:the (?:application|caller|owner|user)|an application|applications|consumers?)\b(?! setup)/gi;
const curlyQuote = /[“”‘’]/g;
const maxDescriptionWords = 35;
const maxDescriptionSentences = 2;
// A sentence ends at a stop, also inside closing quotes or brackets; abbreviations don't end one.
const sentenceEnd = /[.!?]["')\]]?(?=\s|$)/g;
const abbreviation = /\b(?:e\.g|i\.e)\./g;

/** The first paragraph after the H1, as plain text, or `undefined` when there is none. */
export function firstParagraph(body: string): string | undefined {
  const paragraph = /^# .+\n\n([\s\S]+?)(?:\n\n|$)/m.exec(body)?.[1];
  if (!paragraph || paragraph.startsWith('<')) return undefined;
  return paragraph.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, ' ');
}

function at(file: string, text: string, index: number): string {
  const line = text.slice(0, index).split('\n').length;
  const context = text.slice(Math.max(0, index - 20), index + 20).replace(/\s+/g, ' ');
  return `${file}:${line} ("…${context}…")`;
}

/**
 * Each problem as `file:line ("…context…"): what to do`. `prose` is where stand-ins count, such as
 * an example's comments; curly quotes count anywhere in `text`.
 */
export function wordingProblems(file: string, text: string, prose = text): string[] {
  return [
    ...[...prose.matchAll(standIn)].map(
      (match) =>
        `${at(file, text, match.index)}: address the developer as "you", not "${match[0]}".`,
    ),
    ...[...text.matchAll(curlyQuote)].map(
      (match) => `${at(file, text, match.index)}: use straight quotes, not ${match[0]}.`,
    ),
  ];
}

/** A problem with a component page's first paragraph, the page's `llms.txt` line. */
export function descriptionProblem(file: string, body: string): string | undefined {
  const paragraph = firstParagraph(body);
  if (!paragraph) return `${file}: start the page with an H1 and a one-paragraph description.`;
  const start = `("${paragraph.slice(0, 40)}…")`;
  const words = paragraph.split(' ').filter(Boolean).length;
  if (words > maxDescriptionWords) {
    return `${file} ${start}: keep the first paragraph to ${maxDescriptionWords} words, not ${words}.`;
  }
  const plain = paragraph.replace(/`[^`]*`/g, 'code').replace(abbreviation, 'eg');
  const sentences = plain.match(sentenceEnd)?.length ?? 0;
  if (sentences > maxDescriptionSentences) {
    return `${file} ${start}: keep the first paragraph to ${maxDescriptionSentences} sentences, not ${sentences}.`;
  }
  return undefined;
}
