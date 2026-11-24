import type {APIRoute} from 'astro';
import {getEntry} from 'astro:content';

import {text} from '../lib/api.ts';
import {markdownLinks} from '../lib/component-docs.ts';

export const GET: APIRoute = async () => {
  const entry = await getEntry('guides', 'application-setup');
  if (!entry) throw new Error('packages/react/docs/application-setup.mdx is missing.');
  return text(markdownLinks(entry.body ?? ''), 'text/markdown');
};
