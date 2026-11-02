import elanorTheme from '@earendil-works/elanor-shiki-theme';
import {createHighlighterCore, type HighlighterCore, type ThemedToken} from 'shiki/core';
import {createJavaScriptRegexEngine} from 'shiki/engine/javascript';
import {bundledLanguages, type BundledLanguage} from 'shiki/langs';

let highlighter: Promise<HighlighterCore> | undefined;

/**
 * Tokens colored with Elanor's code syntax tokens, or null for a language Shiki doesn't know, as
 * an unchecked string cast to the type can be.
 */
export async function highlightCode(
  code: string,
  language: BundledLanguage,
): Promise<ThemedToken[][] | null> {
  if (!Object.hasOwn(bundledLanguages, language)) {
    return null;
  }
  highlighter ??= createHighlighterCore({
    themes: [elanorTheme],
    langs: [],
    engine: createJavaScriptRegexEngine(),
  });
  const loaded = await highlighter;
  await loaded.loadLanguage(bundledLanguages[language]);
  return loaded.codeToTokensBase(code, {lang: language, theme: elanorTheme.name});
}
