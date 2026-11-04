import {codeToTokens as highlightsTokens} from '@pierre/highlights';
import {codeToTokensBase as shikiTokens} from 'shiki';
import {describe, expect, it} from 'vitest';

import highlightsTheme from '../src/highlights.ts';
import shikiTheme from '../src/shiki.ts';

const tokenColors = new Set(
  [
    '',
    '-comment',
    '-punctuation',
    '-keyword',
    '-function',
    '-variable',
    '-string',
    '-number',
    '-type',
  ].map((role) => `var(--semantic-color-text-code${role})`),
);
// Highlights falls back through an unset `foreground` palette entry to the plain code color.
const highlightsForeground =
  'var(--semantic-color-text-code-foreground, var(--semantic-color-text-code))';

const samples = [
  [
    'tsx',
    `import {Button} from '@earendil-works/elanor-react';

/** Saves the draft. */
export function Save({count}: {count: number}) {
  const label = \`Save \${count}\`;
  return <Button disabled={count === 0 || this?.busy}>{label}</Button>;
}`,
  ],
  [
    'css',
    `@layer app {
  .note:hover { color: var(--semantic-color-text-secondary); margin: 0 1rem; }
}`,
  ],
  ['json', `{"name": "elanor", "private": true, "version": 1, "files": ["dist"], "x": null}`],
  [
    'sh',
    `pnpm add @earendil-works/elanor-react # install
echo "$HOME" && exit 1`,
  ],
  [
    'html',
    `<!doctype html>
<link rel="icon" href="/favicon.ico" sizes="32x32" />`,
  ],
] as const;

describe.each(samples)('%s', (lang, code) => {
  it('colors Shiki tokens only with code syntax tokens', async () => {
    const lines = await shikiTokens(code, {lang, theme: shikiTheme});
    for (const token of lines.flat()) {
      expect(tokenColors).toContain(token.color);
    }
  });

  it('colors Highlights tokens only with code syntax tokens', () => {
    const {tokens} = highlightsTokens(code, {lang, theme: highlightsTheme});
    for (const token of tokens.flat()) {
      expect(token.color === highlightsForeground || tokenColors.has(token.color ?? '')).toBe(true);
    }
  });
});
