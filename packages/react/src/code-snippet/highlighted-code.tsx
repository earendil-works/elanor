import {useEffect, useState} from 'react';

/** A run of code in one color. Shiki's and Highlights' tokens match this shape. */
export interface CodeToken {
  readonly content: string;
  readonly color?: string | undefined;
}

/** Highlighted code: the tokens of each line, from one theme. */
export type HighlightedLines = readonly (readonly CodeToken[])[];

/**
 * Highlights code in the browser. Resolves to null for code it can't highlight, such as an unknown
 * language. Create it once, outside components: a new function highlights again.
 */
export type CodeHighlighter = (code: string, language: string) => Promise<HighlightedLines | null>;

export interface HighlightedCodeProps {
  readonly lines: HighlightedLines;
}

/** Renders highlighted lines inside a `CodeSnippet`, on the server or in the browser. */
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
 * Highlights code after the component mounts. Returns undefined until the lines are ready, on the
 * server, and for code the highlighter can't highlight; show the plain code then. Failures are
 * reported, and the code stays plain.
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
