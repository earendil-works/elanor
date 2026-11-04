import {useEffect, useState} from 'react';

/** A run of code in one color. Shiki's and Highlights' themed tokens are code tokens. */
export interface CodeToken {
  readonly content: string;
  readonly color?: string | undefined;
}

/** Highlighted code: the tokens of each line, from one theme. */
export type HighlightedLines = readonly (readonly CodeToken[])[];

/**
 * Highlights code in the browser, resolving to null for code it can't highlight, such as an
 * unknown language. Create it once, outside components: `useHighlightedCode` highlights again
 * whenever it receives a different function.
 */
export type CodeHighlighter = (code: string, language: string) => Promise<HighlightedLines | null>;

export interface HighlightedCodeProps {
  readonly lines: HighlightedLines;
}

/**
 * Highlighted lines as the content of a `CodeSnippet`. It renders the same on the server and in
 * the browser, so code highlighted ahead of time needs no JavaScript.
 */
export function HighlightedCode({lines}: HighlightedCodeProps) {
  return lines.map((line, index) => (
    // Lines never reorder, so their position is a stable key.
    <span key={index}>
      {line.map((token, tokenIndex) => (
        <span key={tokenIndex} style={{color: token.color}}>
          {token.content}
        </span>
      ))}
      {index < lines.length - 1 ? '\n' : null}
    </span>
  ));
}

interface Highlighted {
  readonly code: string;
  readonly language: string;
  readonly lines: HighlightedLines | null;
}

/**
 * Highlights code with `highlighter` once the component mounts. Until the lines are ready, on the
 * server, and for code the highlighter can't highlight, it returns undefined: show the plain
 * code. A failure is reported, and the code stays plain.
 */
export function useHighlightedCode(
  code: string,
  language: string,
  highlighter: CodeHighlighter,
): HighlightedLines | undefined {
  const [highlighted, setHighlighted] = useState<Highlighted>();

  useEffect(() => {
    // An earlier request that resolves late must not replace the lines of the current code.
    let current = true;
    highlighter(code, language).then((lines) => {
      if (current) {
        setHighlighted({code, language, lines});
      }
    }, reportError);
    return () => {
      current = false;
    };
  }, [code, language, highlighter]);

  // Lines of the previous code would show the wrong text while the new code highlights.
  return highlighted?.code === code && highlighted.language === language
    ? (highlighted.lines ?? undefined)
    : undefined;
}
