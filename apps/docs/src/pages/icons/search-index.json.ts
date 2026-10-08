import type {APIRoute} from 'astro';

import {json, loadIcons} from '../../lib/api.ts';

/**
 * The icon browser's search index, next to the icons page so it cannot collide with an icon named "search":
 * [name, space-separated tags, React component name], alphabetically ordered.
 */
export const GET: APIRoute = async () =>
  json(
    (await loadIcons()).map((icon) => [icon.name, icon.tags.join(' '), icon.component]),
    {compact: true},
  );
