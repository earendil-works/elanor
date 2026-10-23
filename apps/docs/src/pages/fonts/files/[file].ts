import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';

import type {APIRoute, GetStaticPaths} from 'astro';

import {fontDownloads} from '../../../lib/fonts.ts';
import {fontsDist} from '../../../lib/packages.ts';

export const getStaticPaths = (async () =>
  (await fontDownloads()).map((file) => ({params: {file}}))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({params}) =>
  new Response(await readFile(resolve(fontsDist, 'files', String(params.file))), {
    headers: {'Content-Type': 'font/otf'},
  });
