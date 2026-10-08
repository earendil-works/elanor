import {readdir, readFile} from 'node:fs/promises';
import {resolve} from 'node:path';

import type {APIRoute, GetStaticPaths} from 'astro';

import {iconsDist} from '../../../lib/packages.ts';

export const getStaticPaths = (async () =>
  (await readdir(resolve(iconsDist, 'svg')))
    .filter((file) => file.endsWith('.svg'))
    .map((file) => ({params: {name: file.slice(0, -'.svg'.length)}}))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({params}) =>
  new Response(await readFile(resolve(iconsDist, 'svg', `${params.name}.svg`)), {
    headers: {'Content-Type': 'image/svg+xml'},
  });
