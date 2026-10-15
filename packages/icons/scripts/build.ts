import {mkdir, readdir, readFile, rm, writeFile} from 'node:fs/promises';
import {basename, dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

import {pipelineConfigs} from '../config.js';
import {validateMetadata} from './lib/metadata.js';
import {processSvg} from './lib/pipeline.js';

// Builds one icon package: the plain icons for @earendil-works/elanor-icons, or
// with `boiled` the boiled icons for @earendil-works/elanor-icons-boiled. The
// output goes to dist/ in the package that runs the build.
const variant = process.argv[2] ?? 'plain';
if (!(variant in pipelineConfigs)) throw new Error(`Unknown icon variant ${variant}`);
const config = pipelineConfigs[variant as keyof typeof pipelineConfigs];

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDirectory = resolve(packageDirectory, 'sources');
const outputDirectory = resolve(process.cwd(), 'dist');
const svgDirectory = resolve(outputDirectory, 'svg');

const sourceFiles = (await readdir(sourceDirectory)).filter((name) => name.endsWith('.svg')).sort();
if (sourceFiles.length === 0) throw new Error('No vendored SVGs found in sources/');

const metadata: unknown = JSON.parse(
  await readFile(resolve(packageDirectory, 'metadata.json'), 'utf8'),
);
validateMetadata(metadata, sourceFiles);

await rm(outputDirectory, {recursive: true, force: true});
await mkdir(svgDirectory, {recursive: true});
await writeFile(
  resolve(outputDirectory, 'svg.d.ts'),
  'declare const url: string;\nexport default url;\n',
);

// Search tags, keyed by the public (hyphenated) icon name.
await writeFile(
  resolve(outputDirectory, 'metadata.json'),
  JSON.stringify(
    Object.fromEntries(
      Object.entries(metadata).map(([name, entry]) => [name.replaceAll('_', '-'), entry]),
    ),
  ),
);

for (const sourceFile of sourceFiles) {
  const source = await readFile(resolve(sourceDirectory, sourceFile), 'utf8');
  const {svg} = processSvg(source, config, sourceFile);
  await writeFile(resolve(svgDirectory, basename(sourceFile).replaceAll('_', '-')), svg);
}

console.log(`Built ${sourceFiles.length} ${variant} icons.`);
