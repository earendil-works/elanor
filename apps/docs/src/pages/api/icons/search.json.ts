import type {APIRoute} from 'astro';
import {readdir, readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {type IconEntry, iconsDist} from '../../../lib/packages.ts';

/** Compact search index: [name, space-separated tags, popularity], most popular first. */
export const GET: APIRoute = async () => {
  const metadata = JSON.parse(await readFile(resolve(iconsDist, 'metadata.json'), 'utf8')) as Record<string, IconEntry>;
  const names = (await readdir(resolve(iconsDist, 'svg'))).map((file) => file.slice(0, -'.svg'.length));
  const index = names
    .map((name) => {
      const entry = metadata[name];
      return [name, entry ? [...entry.tags, ...entry.categories.map((category) => category.toLowerCase())].join(' ') : '', entry?.popularity ?? 0] as const;
    })
    .sort((a, b) => b[2] - a[2] || a[0].localeCompare(b[0]));
  return new Response(JSON.stringify(index), {headers: {'Content-Type': 'application/json'}});
};
