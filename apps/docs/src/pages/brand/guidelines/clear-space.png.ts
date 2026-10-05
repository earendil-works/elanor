import type {APIRoute} from 'astro';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {logosGuidelines} from '../../../lib/packages.ts';

// The guidelines reference their image relatively, so it is served next to the page.
export const GET: APIRoute = async () =>
  new Response(await readFile(resolve(logosGuidelines, 'clear-space.png')), {headers: {'Content-Type': 'image/png'}});
