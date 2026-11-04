# `@earendil-works/elanor-code-themes`

Themes whose colors are Elanor's code syntax tokens: plain code in `semantic.color.text.code`, the eight syntax roles (comment, punctuation, keyword, function, variable, string, number, type) in its children, on `semantic.color.background.fill.secondary`. The colors are CSS variables, so one theme covers light and dark and every brand; load a brand's token CSS from `@earendil-works/design-tokens` on the page.

Each highlighter has its own subpath. The highlighter is not a dependency: install the one you use.

## Shiki

```ts
import elanorTheme from '@earendil-works/elanor-code-themes/shiki';
import {codeToHtml} from 'shiki';

const html = await codeToHtml(code, {lang: 'tsx', theme: elanorTheme});
```

The theme is checked against Shiki's `ThemeRegistration` type at build time. Its type declarations don't import Shiki.
