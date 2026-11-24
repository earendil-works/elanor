import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';

import type {APIRoute} from 'astro';

import {text} from '../lib/api.ts';

export const GET: APIRoute = async () =>
  text(
    await readFile(
      resolve(process.cwd(), '../../packages/react/docs/application-setup.md'),
      'utf8',
    ),
    'text/markdown',
  );
