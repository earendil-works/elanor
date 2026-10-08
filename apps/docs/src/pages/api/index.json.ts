import type {APIRoute} from 'astro';

import {json} from '../../lib/api.ts';

export const GET: APIRoute = () =>
  json({
    description:
      'Elanor design API: static, read-only JSON. Start at an index to see what exists, then fetch only the group, token, icon, or brand you need.',
    documentation: '/llms.txt',
    indexes: {
      tokens: '/api/tokens/index.json',
      icons: '/api/icons/index.json',
      logos: '/api/logos/index.json',
    },
    brandGuidelines: '/brand/llms.txt',
  });
