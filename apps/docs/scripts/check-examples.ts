// Checks the docs' demos and excerpts as the build does (`plugins/demos.ts`), without building.
import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {join} from 'node:path';

import {assertDemos} from '../src/lib/demo-blocks.ts';

const react = join(import.meta.dirname, '../../../packages/react');

const pages = [
  ...readdirSync(join(react, 'src'), {withFileTypes: true})
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(react, 'src', entry.name, `${entry.name}.mdx`)),
  ...readdirSync(join(react, 'docs'))
    .filter((name) => name.endsWith('.mdx'))
    .map((name) => join(react, 'docs', name)),
].filter((path) => existsSync(path));

const problems: string[] = [];
for (const path of pages) {
  const source = readFileSync(path, 'utf8');
  try {
    assertDemos(source, path);
  } catch (error) {
    problems.push(error instanceof Error ? error.message : String(error));
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
