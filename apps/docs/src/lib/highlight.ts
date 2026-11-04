import elanorTheme from '@earendil-works/elanor-code-themes/shiki';
import type {HighlightedLines} from '@earendil-works/elanor-react';
import {codeToTokensBase, type BundledLanguage} from 'shiki';

/**
 * Highlights code with Elanor's Shiki theme, like the docs' Markdown code blocks, as the lines of
 * a `HighlightedCode`.
 */
export function highlight(code: string, lang: BundledLanguage): Promise<HighlightedLines> {
  return codeToTokensBase(code, {lang, theme: elanorTheme});
}
