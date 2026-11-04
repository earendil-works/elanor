import elanorTheme from '@earendil-works/elanor-code-themes/shiki';
import type {CodeHighlighter} from '@earendil-works/elanor-react';
import type {HighlighterCore, LanguageInput} from 'shiki/core';

// The languages the app highlights, each loaded when it first appears.
const languages = new Map<string, LanguageInput>([
  ['tsx', () => import('shiki/langs/tsx.mjs')],
  ['css', () => import('shiki/langs/css.mjs')],
  ['json', () => import('shiki/langs/json.mjs')],
]);

let shiki: Promise<HighlighterCore> | undefined;

async function createShiki() {
  const [{createHighlighterCore}, {createJavaScriptRegexEngine}] = await Promise.all([
    import('shiki/core'),
    import('shiki/engine/javascript'),
  ]);
  return createHighlighterCore({
    themes: [elanorTheme],
    langs: [],
    engine: createJavaScriptRegexEngine(),
  });
}

export const highlighter: CodeHighlighter = async (code, language) => {
  const grammar = languages.get(language);
  if (!grammar) {
    return null;
  }
  shiki ??= createShiki();
  const loaded = await shiki;
  await loaded.loadLanguage(grammar);
  // A long minified line would stall the page while Shiki tokenizes it; keep such lines plain.
  return loaded.codeToTokensBase(code, {
    lang: language,
    theme: elanorTheme.name,
    tokenizeMaxLineLength: 1000,
  });
};
