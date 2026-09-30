import type {APIRoute} from 'astro';
import {text, tokenBrands} from '../lib/api.ts';

export const GET: APIRoute = () =>
  text(`# Elanor

> Elanor is the Earendil design system: design tokens for the Earendil, Pi, Radius, and Lefos brands, React components, boiled Material Symbols icons, and brand logos. Everything listed here is a static JSON or asset file.

## Brand

- [Brand guidelines and logo rules](/brand/llms.txt): read before creating anything with a logo. Links every logo file.
- [Logo manifest](/api/logos.json): brands, background colors, and every logo asset with SVG, PNG, and CMYK PDF URLs, favicons, avatars, and press kits.

## Design tokens

${tokenBrands
  .map(
    (brand) =>
      `- [${brand} tokens](/api/tokens/${brand}.json): every token with its light and dark value, CSS variable, and description. Single tokens: \`/api/tokens/${brand}/<token.path>.json\`; stylesheet: [/api/tokens/${brand}.css](/api/tokens/${brand}.css).`,
  )
  .join('\n')}

Token values are W3C DTCG values. Colors also include \`hex\`; key colors used in print include CMYK builds under \`extensions["com.earendil-works.print"]\`. Prefer \`semantic.*\` tokens; \`primitive.*\` tokens are the palette they alias.

## Icons

- [Icon catalogue](/api/icons.json): every icon's name, keywords, React import, and SVG URL. Single icons: \`/api/icons/<name>.json\` and \`/api/icons/<name>.svg\`.

## Optional

- [API index](/api/index.json): the endpoints above as JSON.
- [Icon browser](/icons/) and [logo page](/brand/) for people.
`);
