// Checks the docs' demos and excerpts as the build does (`plugins/demos.ts`), without building.
import {globSync, readFileSync} from 'node:fs';
import {join} from 'node:path';

import {assertDemos} from '../src/lib/demo-blocks.ts';

const react = join(import.meta.dirname, '../../../packages/react');

// The content collections' globs (`src/content.config.ts`).
const pages = [
  ...globSync('*/*.mdx', {cwd: join(react, 'src')}).map((path) => join(react, 'src', path)),
  ...globSync('*.mdx', {cwd: join(react, 'docs')}).map((path) => join(react, 'docs', path)),
];

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
