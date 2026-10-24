import {readFile} from 'node:fs/promises';
import {basename, resolve} from 'node:path';

import type {APIRoute, GetStaticPaths} from 'astro';

import {logoContentType, logosDist, siteFavicons} from '../lib/packages.ts';

// Browsers and the web manifest look for favicons at the site root.
export const getStaticPaths = (async () =>
  Object.entries(await siteFavicons())
    // The head tags are rendered by site-head.astro.
    .filter(([key]) => key !== 'html')
    .map(([, path]) => ({
      params: {favicon: basename(path)},
      props: {path},
    }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({props}) => {
  const path = String(props.path);
  return new Response(await readFile(resolve(logosDist, path)), {
    headers: {'Content-Type': logoContentType(path)},
  });
};
