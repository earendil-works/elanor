import elanorTheme from '@earendil-works/elanor-shiki-theme';
import {createHighlighterCore, type HighlighterCore, type ThemedToken} from 'shiki/core';
import {createJavaScriptRegexEngine} from 'shiki/engine/javascript';
import {bundledLanguages, type BundledLanguage} from 'shiki/langs';


let highlighter: Promise<HighlighterCore> | undefined;

/** Tokens colored with Elanor's code syntax tokens, or null for a language Shiki doesn't know. */
export async function highlightCode(
  code: string,
  language: string,
): Promise<ThemedToken[][] | null> {
  if (!Object.hasOwn(bundledLanguages, language)) {
    return null;
  }
  const bundled = language as BundledLanguage;
  highlighter ??= createHighlighterCore({
    themes: [elanorTheme],
    langs: [],
    engine: createJavaScriptRegexEngine(),
  });
  const loaded = await highlighter;
  await loaded.loadLanguage(bundledLanguages[bundled]);
  return loaded.codeToTokensBase(code, {lang: bundled, theme: elanorTheme.name});
}
