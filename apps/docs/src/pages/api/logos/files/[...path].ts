import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';

import type {APIRoute, GetStaticPaths} from 'astro';

import {listFiles, logoContentType, logosDist} from '../../../../lib/packages.ts';

// Serves the built logo package: SVGs, kits, press kits, and the manifest.
export const getStaticPaths = (async () =>
  (await listFiles(logosDist)).map((path) => ({params: {path}}))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({params}) => {
  const path = params.path!;
  return new Response(await readFile(resolve(logosDist, path)), {
    headers: {'Content-Type': logoContentType(path)},
  });
};
