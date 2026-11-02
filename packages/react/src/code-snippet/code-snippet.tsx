import {Suspense, use, type HTMLAttributes, type ReactNode, type Ref} from 'react';
import type {ThemedToken} from 'shiki/core';

import {classes} from '../utils/class-names.ts';

import styles from './code-snippet.module.css';

export interface CodeSnippetProps extends Omit<HTMLAttributes<HTMLPreElement>, 'children'> {
  readonly ref?: Ref<HTMLPreElement> | undefined;
  /** The code, rendered inside `<code>`. Highlighting needs it as a string. */
  readonly children?: ReactNode;
  /** Controls at the end of the snippet, such as a copy button. */
  readonly actions?: ReactNode;
  /**
   * Turns on syntax highlighting for this language: a Shiki language name or alias, such as
   * `tsx`, `json` or `sh`. Leave it out for plain text, such as commands, keys and codes.
   */
  readonly language?: string | undefined;
}

export function CodeSnippet({
  ref,
  children,
  actions,
  language,
  className,
  ...props
}: CodeSnippetProps) {
  return (
    <pre {...props} ref={ref} className={classes(styles.root, className)}>
      <code className={styles.code}>
        {language && typeof children === 'string' ? (
          <Suspense fallback={children}>
            <HighlightedCode code={children} language={language} />
          </Suspense>
        ) : (
          children
        )}
      </code>
      {actions ? <span className={styles.actions}>{actions}</span> : null}
    </pre>
  );
}

/*
 * Highlighting is progressive. Shiki loads only when a snippet asks for highlighting, and each
 * grammar only when its language first appears. Until both are ready, and on the server, the
 * snippet shows the code as plain text, so the page doesn't shift; for an unknown language, or if
 * Shiki fails to load, the plain text stays.
 *
 * `use` reads a promise cached per language and code: a promise created during render would
 * suspend forever. The cache keeps the most recent snippets, so returning to a page doesn't
 * highlight again. Tokens render as spans colored by Elanor's code syntax tokens, never as HTML.
 */
function HighlightedCode({code, language}: {code: string; language: string}) {
  const lines = use(highlight(code, language));
  if (!lines) {
    return code;
  }
  return lines.map((line, index) => (
    // Lines never reorder, so their position is a stable key.
    <span key={index}>
      {line.map((token) => (
        <span key={token.offset} style={{color: token.color}}>
          {token.content}
        </span>
      ))}
      {index < lines.length - 1 ? '\n' : null}
    </span>
  ));
}

const MAX_CACHED_SNIPPETS = 50;
const cache = new Map<string, Promise<ThemedToken[][] | null>>();

function highlight(code: string, language: string) {
  const key = `${language}\n${code}`;
  let tokens = cache.get(key);
  if (!tokens) {
    tokens = import('./code-snippet-highlighter.ts')
      .then(({highlightCode}) => highlightCode(code, language))
      .catch(() => null);
    cache.set(key, tokens);
    if (cache.size > MAX_CACHED_SNIPPETS) {
      cache.delete(cache.keys().next().value!);
    }
  }
  return tokens;
}
