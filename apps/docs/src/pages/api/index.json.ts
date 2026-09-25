import type {APIRoute} from 'astro';
import {json, tokenBrands} from '../../lib/api.ts';

export const GET: APIRoute = () =>
  json({
    description: 'Elanor design API: static, read-only JSON and files for design tokens, icons, and logos.',
    documentation: '/llms.txt',
    endpoints: {
      tokens: {
        brands: tokenBrands.map((brand) => ({
          brand,
          all: `/api/tokens/${brand}.json`,
          css: `/api/tokens/${brand}.css`,
          token: `/api/tokens/${brand}/{token.path}.json`,
        })),
      },
      icons: {all: '/api/icons.json', icon: '/api/icons/{name}.json', svg: '/api/icons/{name}.svg'},
      logos: {manifest: '/api/logos.json', guidelines: '/brand/llms.txt'},
    },
  });
