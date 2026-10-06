import type {APIRoute} from 'astro';
import {text, tokenBrands} from '../lib/api.ts';

export const GET: APIRoute = async () =>
  text(`# Elanor

> Elanor is the Earendil design system: design tokens for the ${(await tokenBrands()).join(', ')} brands, React components, boiled Material Symbols icons, and brand logos. Everything listed here is a static JSON or asset file.

Each area has a small index that lists what exists. Fetch the index first, then only the group, token, icon, or brand you need; there are no full dumps.

## Design tokens

- [Token index](/api/tokens/index.json): the brands, each with its own token index.
- \`/api/tokens/<brand>/index.json\`: every token group with its token names; semantic tokens include a description of when to use them.
- \`/api/tokens/<brand>/groups/<group>.json\`: all tokens in a group, such as \`semantic.color.text\`.
- \`/api/tokens/<brand>/tokens/<token.path>.json\`: one token.

A token has its light and dark value as CSS and as a W3C DTCG value, its CSS variable, its description, and what it aliases. Colors also include \`hex\`; key colors used in print include CMYK builds under \`extensions["com.earendil-works.print"]\`. Prefer \`semantic.*\` tokens; \`primitive.*\` tokens are the palette they alias.

## Icons

- [Icon index](/api/icons/index.json): every icon name.
- \`/api/icons/keywords/<word>.json\`: the icons whose name or keywords contain a word, such as \`arrow\` or \`settings\`.
- \`/api/icons/<name>.json\`: one icon's keywords, React import, and SVG URL; \`/api/icons/<name>.svg\`: the SVG.

## Brand

- [Brand guidelines and logo rules](/brand/llms.txt): read before creating anything with a logo. Links every logo file.
- [Logo index](/api/logos/index.json): usage rules and each brand with its background colors.
- \`/api/logos/brands/<brand>.json\`: one brand's logos with SVG, PNG, and CMYK PDF URLs, favicons, profile pictures, and press kit.

## Optional

- [API index](/api/index.json): the indexes above as JSON.
- [Icon browser](/icons/) and [logo page](/brand/) for people.
`);
