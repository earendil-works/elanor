import {readFile, writeFile} from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const tokenRoot = new URL('../../design-tokens/tokens/shared/', import.meta.url);
const semantic = JSON.parse(await readFile(new URL('semantic/dimension.tokens.json', tokenRoot), 'utf8'));
const primitive = JSON.parse(await readFile(new URL('primitive/dimension.tokens.json', tokenRoot), 'utf8'));
const sources = {...semantic, ...primitive};
const check = process.argv.includes('--check');

function dimension(path, chain = []) {
  if (chain.includes(path)) {
    throw new Error(`Circular layout token reference: ${[...chain, path].join(' -> ')}`);
  }
  const token = path.split('.').reduce((value, key) => value?.[key], sources);
  if (!token) throw new Error(`Unknown layout token: ${path}`);
  const value = token.$value;
  if (typeof value === 'string') return dimension(value.slice(1, -1), [...chain, path]);
  if (token.$type && token.$type !== 'dimension') throw new Error(`Not a dimension: ${path}`);
  if (!Number.isFinite(value?.value) || !['rem', 'px'].includes(value.unit)) {
    throw new Error(`Invalid layout dimension: ${path}`);
  }
  return `${value.value}${value.unit}`;
}

// CSS cannot use var() in query conditions. Resolve only explicitly annotated
// min-width values; all selectors, declarations and formatting stay author-owned.
const threshold = /(\bmin-width:\s*)[\d.]+(?:rem|px)(\s*\/\*\s*token:\s*(semantic\.dimension\.breakpoint\.\w+)\s*\*\/)/g;
const annotation = /\/\*\s*token:/g;

for (const path of ['src/grid/grid.module.css', 'src/layout/layout.module.css']) {
  const url = new URL(path, root);
  const source = await readFile(url, 'utf8');
  let resolved = 0;
  const output = source.replace(threshold, (_, prefix, suffix, token) => {
    resolved++;
    return `${prefix}${dimension(token)}${suffix}`;
  });
  if (!resolved || resolved !== (source.match(annotation)?.length ?? 0)) {
    throw new Error(`${path}: expected token annotations on min-width dimensions in rem or px.`);
  }
  if (output === source) continue;
  if (check) {
    throw new Error(`${path} has stale breakpoint values. Run pnpm --filter @earendil-works/elanor-react generate:css`);
  }
  await writeFile(url, output);
}
