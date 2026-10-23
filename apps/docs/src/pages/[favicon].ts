import {readFile} from 'node:fs/promises';
import {basename, resolve} from 'node:path';

import type {APIRoute, GetStaticPaths} from 'astro';

import {logoContentType, logosDist, siteFavicons} from '../lib/packages.ts';

// Serves the flower's favicons from the site root, where browsers and the web manifest look for them.
export const getStaticPaths = (async () =>
  Object.entries(await siteFavicons())
    // The head snippet documents the tags; the layouts render them.
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
