import type {APIRoute, GetStaticPaths} from 'astro';
import {readFile} from 'node:fs/promises';
import {extname, resolve} from 'node:path';
import {listFiles, logosDist} from '../../../../lib/packages.ts';

/** Every file type the logo build writes. Browsers only render SVG images served with their type. */
const contentTypes: Record<string, string> = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.md': 'text/markdown; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
};

// Serves the built logo package: SVGs, kits, press kits, and the manifest.
export const getStaticPaths = (async () =>
  (await listFiles(logosDist)).map((path) => ({params: {path}}))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({params}) => {
  const path = params.path!;
  const contentType = contentTypes[extname(path)];
  if (!contentType) throw new Error(`No content type for logo file ${path}; add its extension to contentTypes`);
  return new Response(await readFile(resolve(logosDist, path)), {headers: {'Content-Type': contentType}});
};
