import {
  useEffect,
  useSyncExternalStore,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import type {ThemedToken} from 'shiki/core';
import type {BundledLanguage} from 'shiki/langs';

import {classes} from '../utils/class-names.ts';

import styles from './code-snippet.module.css';

/** A language Shiki can highlight, by name or alias, such as `tsx`, `json` or `sh`. */
export type CodeSnippetLanguage = BundledLanguage;

export interface CodeSnippetProps extends Omit<HTMLAttributes<HTMLPreElement>, 'children'> {
  readonly ref?: Ref<HTMLPreElement> | undefined;
  /** The code, rendered inside `<code>`. Highlighting needs it as a string. */
  readonly children?: ReactNode;
  /** Controls at the end of the snippet, such as a copy button. */
  readonly actions?: ReactNode;
  /**
   * Turns on syntax highlighting for this language. Leave it out for plain text, such as
   * commands, keys and codes.
   */
  readonly language?: CodeSnippetLanguage | undefined;
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
          <HighlightedCode code={children} language={language} />
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
 * grammar only when its language first appears. Until both are ready, and on the server and during
 * hydration, the snippet shows the code as plain text, so the page doesn't shift; for an unknown
 * language the plain text stays. A failure to load or highlight is not caught: it surfaces as an
 * unhandled rejection, the plain text stays, and the next mount tries again.
 *
 * Tokens live in a cache shared by all snippets, so returning to a page shows them without
 * highlighting again. Mounted snippets keep their entries; past the limit, the least recently used
 * of the others are evicted. Tokens render as spans colored by Elanor's code syntax tokens, never
 * as HTML.
 */
function HighlightedCode({code, language}: {code: string; language: CodeSnippetLanguage}) {
  const key = `${language}\n${code}`;
  const lines = useSyncExternalStore(
    subscribe,
    () => cache.get(key),
    () => undefined,
  );

  useEffect(() => {
    retain(key);
    if (!cache.has(key)) {
      void import('./code-snippet-highlighter.ts')
        .then(({highlightCode}) => highlightCode(code, language))
        .then((tokens) => {
          if (tokens) {
            remember(key, tokens);
          }
        });
    }
    return () => release(key);
  }, [key, code, language]);

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
/** Tokens by language and code, least recently used first. */
const cache = new Map<string, ThemedToken[][]>();
/** How many mounted snippets show each entry, which keeps it from eviction. */
const users = new Map<string, number>();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function retain(key: string) {
  users.set(key, (users.get(key) ?? 0) + 1);
  const lines = cache.get(key);
  if (lines) {
    cache.delete(key);
    cache.set(key, lines);
  }
}

function release(key: string) {
  const count = users.get(key)! - 1;
  if (count === 0) {
    users.delete(key);
  } else {
    users.set(key, count);
  }
  evict();
}

function remember(key: string, lines: ThemedToken[][]) {
  cache.delete(key);
  cache.set(key, lines);
  evict();
  for (const listener of listeners) {
    listener();
  }
}

function evict() {
  for (const key of cache.keys()) {
    if (cache.size <= MAX_CACHED_SNIPPETS) {
      return;
    }
    if (!users.has(key)) {
      cache.delete(key);
    }
  }
}
