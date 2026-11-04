# `@earendil-works/elanor-code-themes`

Themes whose colors are Elanor's code syntax tokens: plain code in `semantic.color.text.code`, the eight syntax roles (comment, punctuation, keyword, function, variable, string, number, type) in its children, on `semantic.color.background.fill.secondary`. The colors are CSS variables, so one theme covers light and dark and every brand; load a brand's token CSS from `@earendil-works/design-tokens` on the page.

Each highlighter has its own subpath. Neither highlighter is a dependency: install the one you use.

## Shiki

```ts
import elanorTheme from '@earendil-works/elanor-code-themes/shiki';
import {codeToHtml} from 'shiki';

const html = await codeToHtml(code, {lang: 'tsx', theme: elanorTheme});
```

## Highlights

```ts
import elanorTheme from '@earendil-works/elanor-code-themes/highlights';
import {codeToHtml} from '@pierre/highlights';

const html = new TextDecoder().decode(codeToHtml(code, {lang: 'tsx', theme: elanorTheme}));
```

[Highlights](https://diffs.com/docs#highlights) takes only literal colors in a theme, so this theme is a CSS palette: the highlighter writes `var(--semantic-color-text-code-…)` itself.

The themes are checked against Shiki's `ThemeRegistration` and Highlights' `Theme` types at build time. Their type declarations import neither package.
