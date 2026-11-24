import type {APIRoute} from 'astro';

import {text} from '../lib/api.ts';
import {applicationSetup} from '../lib/application-setup.ts';
import {markdownLinks} from '../lib/component-docs.ts';

export const GET: APIRoute = async () =>
  text(markdownLinks((await applicationSetup()).body ?? ''), 'text/markdown');
