// Runs the export plugins listed in exports.config.ts after `scripts/build.ts`.
import {readdir, readFile, rm, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

import {exportPlugins} from '../exports.config.js';
import {createExportContext, type Manifest} from './exports/plugin.js';
import {packageDirectory} from './lib/compose.js';

const distDirectory = resolve(packageDirectory, 'dist');
const manifestPath = resolve(distDirectory, 'manifest.json');

// Exports start from the core build's output alone, so nothing stale survives a renamed or removed export.
const coreOutputs = new Set(['svg', 'manifest.json', 'artwork.json']);
for (const entry of await readdir(distDirectory)) {
  if (!coreOutputs.has(entry)) await rm(resolve(distDirectory, entry), {recursive: true});
}

const context = await createExportContext(
  distDirectory,
  JSON.parse(await readFile(manifestPath, 'utf8')) as Manifest,
  exportPlugins,
);

for (const plugin of exportPlugins) {
  const started = performance.now();
  await plugin.run(context);
  console.log(`Exported ${plugin.name} in ${Math.round(performance.now() - started)} ms.`);
}

await writeFile(manifestPath, `${JSON.stringify(context.manifest, null, 2)}\n`);
