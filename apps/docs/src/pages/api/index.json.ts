import type {APIRoute} from 'astro';

import {json} from '../../lib/api.ts';

export const GET: APIRoute = () =>
  json({
    description:
      'Elanor design API. Static, read-only JSON; start with an index, then fetch individual resources.',
    documentation: '/llms.txt',
    indexes: {
      tokens: '/api/tokens/index.json',
      icons: '/api/icons/index.json',
      logos: '/api/logos/index.json',
    },
    brandGuidelines: '/brand/llms.txt',
  });
