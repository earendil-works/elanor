import type {APIRoute} from 'astro';

import {text, tokenBrands} from '../lib/api.ts';

export const GET: APIRoute = async () =>
  text(`# Elanor

> Earendil's design system: tokens for ${(await tokenBrands()).join(', ')}, React components, icons, and logos.

All endpoints serve static files. Start with an index, then fetch individual resources; bulk dumps are not available.

## Design tokens

- [Brands](/api/tokens/index.json)
- \`/api/tokens/<brand>/index.json\`: groups, token names, and semantic descriptions.
- \`/api/tokens/<brand>/groups/<group>.json\`: a group, e.g. \`semantic.color.text\`.
- \`/api/tokens/<brand>/<token.path>.json\`: a token.

Tokens include light/dark CSS and DTCG values, CSS variables, descriptions, and aliases. Colors include \`hex\`; print colors include CMYK under \`extensions["com.earendil-works.print"]\`. Use \`semantic.*\` tokens in components; \`primitive.*\` defines the palette.

## Icons

- [Icon names](/api/icons/index.json)
- \`/api/icons/keywords/<word>.json\`: name and keyword matches, e.g. \`arrow\`.
- \`/api/icons/<name>.json\`: keywords, React import, and SVG URL.
- \`/api/icons/<name>.svg\`: SVG artwork.

## Brand

- [Brand guidelines](/brand/llms.txt): usage rules and files. Read before using logos.
- [Logo index](/api/logos/index.json): brands, backgrounds, grid unit, and guideline links.
- [Guidelines index](/api/logos/guidelines/index.json)
- \`/api/logos/guidelines/<section>.json\`: a section, e.g. \`clear-space\`.
- \`/api/logos/brands/<brand>.json\`: SVGs, PNGs, CMYK PDFs, favicons, avatars, and press kit.

## Optional

- [API index](/api/index.json): the indexes above as JSON.
- [Icon browser](/icons/) and [logo page](/brand/): HTML pages for people.
`);
