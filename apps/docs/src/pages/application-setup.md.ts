import type {APIRoute} from 'astro';
import {getEntry} from 'astro:content';

import {text} from '../lib/api.ts';
import {markdownLinks} from '../lib/component-docs.ts';

export const GET: APIRoute = async () =>
  text(markdownLinks((await getEntry('guides', 'application-setup'))?.body ?? ''), 'text/markdown');
