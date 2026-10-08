import type {APIRoute} from 'astro';

import {json, tokenBrands} from '../../../lib/api.ts';

export const GET: APIRoute = async () =>
  json({
    brands: (await tokenBrands()).map((brand) => ({
      brand,
      index: `/api/tokens/${brand}/index.json`,
    })),
  });
