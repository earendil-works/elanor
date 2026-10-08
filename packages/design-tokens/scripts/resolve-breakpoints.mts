import {readFile} from 'node:fs/promises';

import {parse} from '@terrazzo/parser';

/** Resolve shared, brand-independent breakpoints for build-time CSS queries. */
export async function resolveBreakpoints() {
  const root = new URL('../tokens/shared/', import.meta.url);
  const sources = await Promise.all(
    ['primitive/dimension.tokens.json', 'semantic/dimension.tokens.json'].map(async (path) => {
      const filename = new URL(path, root);
      return {filename, src: await readFile(filename, 'utf8')};
    }),
  );
  const {resolver} = await parse(sources);
  const breakpoints = new Map<string, string>();

  for (const token of Object.values(resolver.apply({}))) {
    if (!token.id.startsWith('semantic.dimension.breakpoint.')) continue;
    if (token.$type !== 'dimension') {
      throw new Error(`Expected a breakpoint dimension: ${token.id}`);
    }
    const {value, unit} = token.$value;
    if (!Number.isFinite(value) || (unit !== 'rem' && unit !== 'px')) {
      throw new Error(`Expected a finite breakpoint in rem or px: ${token.id}`);
    }
    breakpoints.set(token.id, `${value}${unit}`);
  }

  return breakpoints;
}
