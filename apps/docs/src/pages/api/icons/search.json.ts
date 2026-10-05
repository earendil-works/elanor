import type {APIRoute} from 'astro';
import {readdir, readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {iconComponentNames} from '../../../../plugins/icon-imports.ts';
import {type IconEntry, iconsDist, iconsReactBarrel} from '../../../lib/packages.ts';

/** Compact search index: [name, space-separated tags, React component name], alphabetically ordered. */
export const GET: APIRoute = async () => {
  const metadata = JSON.parse(await readFile(resolve(iconsDist, 'metadata.json'), 'utf8')) as Record<string, IconEntry>;
  const names = (await readdir(resolve(iconsDist, 'svg')))
    .filter((file) => file.endsWith('.svg'))
    .map((file) => file.slice(0, -'.svg'.length));
  const components = iconComponentNames(iconsReactBarrel);
  const index = names.sort().map((name) => {
    const entry = metadata[name];
    if (!entry) throw new Error(`Missing search tags for ${name}`);
    const component = components.get(name);
    if (!component) throw new Error(`${name} has no React component; build @earendil-works/elanor-icons-react first`);
    return [name, entry.tags.join(' '), component] as const;
  });
  return new Response(JSON.stringify(index), {headers: {'Content-Type': 'application/json'}});
};
