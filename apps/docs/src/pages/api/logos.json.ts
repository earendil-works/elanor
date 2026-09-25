import type {APIRoute} from 'astro';
import {json, loadLogos} from '../../lib/api.ts';

export const GET: APIRoute = async () => {
  const manifest = await loadLogos();
  return json({
    rules: {
      gridUnit: 'One quarter of the symbol frame width; logo source units put it at 140.',
      clearSpace: 'Leave at least one grid unit around the whole asset. At a rendered height h, one grid unit is h × 140 / asset.height pixels.',
      treatments: 'Use on-light on light backgrounds and on-dark on dark ones; monochrome only when one color is required. Never recolor.',
      backgrounds: 'Each brand lists its own light and dark background colors.',
      guidelines: '/brand/llms.txt',
    },
    ...manifest,
  });
};
