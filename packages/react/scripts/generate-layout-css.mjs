import {readFile, writeFile} from 'node:fs/promises';

import {resolveBreakpoints} from '../../design-tokens/scripts/resolve-breakpoints.mts';

const root = new URL('../', import.meta.url);
const breakpoints = await resolveBreakpoints();
const check = process.argv.includes('--check');

// CSS cannot use var() in query conditions. Resolve only explicitly annotated
// dimensions; the surrounding query syntax and formatting stay author-owned.
const threshold =
  /(?<![\w.+-])[+-]?(?:\d*\.\d+|\d+)(?:[eE][+-]?\d+)?(?:rem|px)(\s*\/\*\s*token:\s*(semantic\.dimension\.breakpoint\.\w+)\s*\*\/)/g;
const annotation = /\/\*\s*token:/g;

for (const path of [
  'src/grid/grid.module.css',
  'src/layout/layout.module.css',
  'src/top-navigation/top-navigation.example.module.css',
  '../../apps/docs/src/styles/docs.css',
  '../../apps/docs/src/components/brand-logos.module.css',
]) {
  const url = new URL(path, root);
  const source = await readFile(url, 'utf8');
  let resolved = 0;
  const output = source.replace(threshold, (_, suffix, token) => {
    resolved++;
    const value = breakpoints.get(token);
    if (value === undefined) throw new Error(`Unknown layout breakpoint: ${token}`);
    return `${value}${suffix}`;
  });
  if (!resolved || resolved !== (source.match(annotation)?.length ?? 0)) {
    throw new Error(
      `${path}: expected token annotations immediately after dimensions in rem or px.`,
    );
  }
  if (output === source) continue;
  if (check) {
    throw new Error(
      `${path} has stale breakpoint values. Run pnpm --filter @earendil-works/elanor-react generate:css`,
    );
  }
  await writeFile(url, output);
}
