import type {APIRoute, GetStaticPaths} from 'astro';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {listFiles, logosDist} from '../../../lib/packages.ts';

// Serves the built logo package: SVGs, kits, press kits, and the manifest.
export const getStaticPaths = (async () =>
  (await listFiles(logosDist)).map((path) => ({params: {path}}))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({params}) => new Response(await readFile(resolve(logosDist, params.path!)));
