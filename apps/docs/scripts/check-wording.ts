// Checks the docs' sources for wording agents misread (see `src/lib/docs-wording.ts`).
import {execFileSync} from 'node:child_process';
import {readdirSync, readFileSync} from 'node:fs';
import {join, relative} from 'node:path';

import {descriptionProblem, wordingProblems} from '../src/lib/docs-wording.ts';

const root = join(import.meta.dirname, '../../..');
const react = join(root, 'packages/react');

const skipped = /\.test\./;

function files(directory: string): string[] {
  return readdirSync(directory, {recursive: true, encoding: 'utf8'})
    .map((path) => join(directory, path))
    .filter((path) => /\.(?:mdx?|tsx?|css)$/.test(path) && !skipped.test(path));
}

// Blanks all but the matching comments, keeping offsets so reported lines stay right.
const keep = (code: string, comment: RegExp) =>
  code.replace(new RegExp(`${comment.source}|[^\\n]`, 'g'), (match) =>
    match.length > 1 ? match : ' ',
  );
const jsdoc = /\/\*\*[\s\S]*?\*\//;
// In examples, only comments count: demo data may say anything.
const comments = /\/\*[\s\S]*?\*\/|\/\/[^\n]*/;

const problems: string[] = [];
const check = (path: string, text: string, prose?: string) =>
  problems.push(...wordingProblems(relative(root, path), text, prose));

for (const path of files(join(react, 'src'))) {
  const text = readFileSync(path, 'utf8');
  if (path.endsWith('.mdx')) {
    check(path, text);
    const problem = descriptionProblem(relative(root, path), text);
    if (problem) problems.push(problem);
  } else if (/[\\/]examples[\\/]/.test(path)) check(path, text, keep(text, comments));
  else if (/\.tsx?$/.test(path)) check(path, keep(text, jsdoc));
}
for (const path of [
  ...files(join(react, 'docs')),
  ...execFileSync('git', ['ls-files', '*README.md'], {cwd: root, encoding: 'utf8'})
    .split('\n')
    .filter(Boolean)
    .map((path) => join(root, path)),
]) {
  check(path, readFileSync(path, 'utf8'));
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
