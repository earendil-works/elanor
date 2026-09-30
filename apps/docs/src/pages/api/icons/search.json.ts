import type {APIRoute} from 'astro';
import {readdir, readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {type IconEntry, iconsDist} from '../../../lib/packages.ts';

/** Compact search index: [name, space-separated tags], alphabetically ordered. */
export const GET: APIRoute = async () => {
  const metadata = JSON.parse(await readFile(resolve(iconsDist, 'metadata.json'), 'utf8')) as Record<string, IconEntry>;
  const names = (await readdir(resolve(iconsDist, 'svg')))
    .filter((file) => file.endsWith('.svg'))
    .map((file) => file.slice(0, -'.svg'.length));
  const index = names.sort().map((name) => {
    const entry = metadata[name];
    if (!entry) throw new Error(`Missing search tags for ${name}`);
    return [name, entry.tags.join(' ')] as const;
  });
  return new Response(JSON.stringify(index), {headers: {'Content-Type': 'application/json'}});
};
