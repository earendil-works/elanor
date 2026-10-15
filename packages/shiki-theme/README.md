# `@earendil-works/elanor-shiki-theme`

A [Shiki](https://shiki.style) theme whose colors are Elanor's code syntax tokens: plain code in `semantic.color.text.code`, the eight syntax roles (comment, punctuation, keyword, function, variable, string, number, type) in its children, on `semantic.color.background.fill.secondary`. The colors are CSS variables, so one theme covers light and dark and every brand; load a brand's token CSS from `@earendil-works/design-tokens` on the page.

```ts
import elanorTheme from '@earendil-works/elanor-shiki-theme';

const html = await codeToHtml(code, {lang: 'tsx', theme: elanorTheme});
```

The theme is checked against Shiki's `ThemeRegistration` type at build time; Shiki is not a runtime dependency.
