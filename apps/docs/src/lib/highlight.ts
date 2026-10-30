import elanorTheme from '@earendil-works/elanor-shiki-theme';
import {codeToHtml, type BundledLanguage} from 'shiki';

/**
 * Highlights code with Elanor's Shiki theme, like the docs' Markdown code blocks: the HTML of the
 * highlighted lines, for a `CodeSnippet`'s content (`components/highlighted-code.tsx`).
 */
export async function highlight(code: string, lang: BundledLanguage): Promise<string> {
  const html = await codeToHtml(code, {lang, theme: elanorTheme});
  const lines = /<code[^>]*>([\s\S]*)<\/code>/.exec(html)?.[1];
  if (lines === undefined) throw new Error(`Shiki returned no code element for ${lang}.`);
  return lines;
}
