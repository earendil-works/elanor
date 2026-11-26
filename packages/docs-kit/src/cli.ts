#!/usr/bin/env node
import {createHash} from 'node:crypto';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {parseArgs} from 'node:util';

import type {AstroInlineConfig} from 'astro';

import {resolveConfig} from './config.ts';

/*
 * `elanor-docs dev|build|preview`: the docs site of a folder of Markdown, without an Astro project.
 * Astro runs on a project of its own in a cache folder, so nothing is written next to the Markdown
 * except the built site.
 */

const usage = `Usage: elanor-docs <dev|build|preview> [options]

Builds a documentation site from a folder of Markdown (default: ./docs).

Options:
  --docs <dir>    The Markdown folder (default: docs, or the current folder)
  --out <dir>     Where the site is written (default: site)
  --site <url>    Where the site is published, such as https://example.github.io/project/
  --strict        Fail the build on broken links and other problems
  --port <port>   The dev and preview server's port (default: 4321)
  --host          Listen on all addresses
  -h, --help      Show this help
`;

const {positionals, values} = parseArgs({
  allowPositionals: true,
  options: {
    docs: {type: 'string'},
    out: {type: 'string'},
    site: {type: 'string'},
    strict: {type: 'boolean'},
    port: {type: 'string'},
    host: {type: 'boolean'},
    help: {type: 'boolean', short: 'h'},
  },
});

const command = positionals[0];
if (values.help || !command || !['dev', 'build', 'preview'].includes(command)) {
  process.stdout.write(usage);
  process.exit(values.help ? 0 : 1);
}

process.env.ASTRO_TELEMETRY_DISABLED ??= '1';
// Before anything loads React, so React and React DOM pick the same build.
process.env.NODE_ENV ??= command === 'dev' ? 'development' : 'production';
const {build, dev, preview} = await import('astro');
const {default: elanorDocs} = await import('./index.ts');
const cwd = process.cwd();
const config = resolveConfig(cwd, {
  ...(values.docs ? {docs: values.docs} : {}),
  ...(values.site ? {site: values.site} : {}),
  ...(values.strict ? {strict: true} : {}),
});

// Astro's project: an empty folder in the project's dependency cache, or the system's temporary folder.
const key = createHash('sha256').update(config.docsDir).digest('hex').slice(0, 12);
const root = existsSync(join(cwd, 'node_modules'))
  ? join(cwd, 'node_modules/.cache/elanor-docs')
  : join(tmpdir(), `elanor-docs-${key}`);
mkdirSync(join(root, 'src'), {recursive: true});
const outDir = resolve(cwd, values.out ?? 'site');

// Astro and the renderer resolve these from the project's folder: link the kit's own, and list them
// as the project's dependencies, from which Astro learns which packages Vite must bundle.
const require = createRequire(import.meta.url);
const linked = ['astro', '@astrojs/react', 'react', 'react-dom'];
writeFileSync(
  join(root, 'package.json'),
  `${JSON.stringify({private: true, type: 'module', dependencies: Object.fromEntries(linked.map((name) => [name, '*']))}, null, 2)}\n`,
);
for (const name of linked) {
  const target = dirname(require.resolve(`${name}/package.json`));
  const link = join(root, 'node_modules', name);
  mkdirSync(dirname(link), {recursive: true});
  let current: string | undefined;
  try {
    current = readlinkSync(link);
  } catch {
    current = undefined;
  }
  if (current === target) continue;
  rmSync(link, {force: true, recursive: true});
  symlinkSync(target, link, 'dir');
}

const inline: AstroInlineConfig = {
  root,
  configFile: false,
  srcDir: join(root, 'src'),
  publicDir: join(root, 'public'),
  // Built in Astro's project, where the prerendered pages resolve Astro and React, then copied.
  outDir: join(root, 'dist'),
  cacheDir: join(root, '.cache'),
  logLevel: 'info',
  devToolbar: {enabled: false},
  server: {
    ...(values.port ? {port: Number(values.port)} : {}),
    ...(values.host ? {host: true} : {}),
  },
  integrations: [elanorDocs({resolved: config, exclude: [outDir]})],
};

// Astro writes the prerendered pages next to the output when it is inside the working folder, and
// into the working folder otherwise.
process.chdir(root);

try {
  if (command === 'dev') {
    await dev(inline);
  } else if (command === 'build') {
    await build(inline);
    rmSync(outDir, {recursive: true, force: true});
    cpSync(join(root, 'dist'), outDir, {recursive: true});
    process.stdout.write(`The site is in ${outDir}\n`);
  } else {
    await preview({...inline, outDir});
  }
} catch (error) {
  process.stderr.write(`\n${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
}
