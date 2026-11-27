import {readFileSync} from 'node:fs';
import {dirname, relative, resolve} from 'node:path';

/**
 * Matches `<Demo example="./examples/name.tsx" />` on its own line.
 * Component MDX uses only this form for live previews.
 */
export const demoBlock = /^<Demo example="(\.\/examples\/[\w-]+\.tsx)" \/>$/gm;

export interface DemoFile {
  /** Specifier relative to the MDX file, such as `./examples/demo.tsx`. */
  readonly specifier: string;
  /** Absolute path on disk. */
  readonly path: string;
  /** Name shown above the code, relative to `examples/`, such as `demo.tsx` or `hero/chips.tsx`. */
  readonly name: string;
  readonly code: string;
}

const localImport = /^import\s+(?:[^'"]+\s+from\s+)?'(\.\.?\/[^']+)';$/gm;

/** The example file followed by the local files it imports, such as CSS Modules. */
export function demoFiles(mdxPath: string, example: string): DemoFile[] {
  const page = dirname(mdxPath);
  const files: DemoFile[] = [];
  const visit = (path: string) => {
    if (files.some((file) => file.path === path)) return;
    const code = readFileSync(path, 'utf8');
    const specifier = `./${relative(page, path)}`;
    files.push({specifier, path, name: relative(resolve(page, 'examples'), path), code});
    for (const [, local] of code.matchAll(localImport)) {
      if (local) visit(resolve(dirname(path), local));
    }
  };
  visit(resolve(page, example));
  return files;
}

/** Throws if `<Demo` is used in any form other than {@link demoBlock}. */
export function assertDemoSyntax(source: string, id: string): void {
  const all = source.match(/<Demo\b[^>]*>/g) ?? [];
  const valid = source.match(demoBlock) ?? [];
  if (all.length !== valid.length) {
    throw new Error(`${id}: write demos as <Demo example="./examples/name.tsx" /> on one line.`);
  }
}

/** Matches a code fence quoting an example, such as ```` ```tsx from="./examples/demo.tsx" ````. */
const excerptBlock = /^```\w+ from="(\.\/examples\/[\w/.-]+)"\n([\s\S]*?)^```$/gm;

/**
 * Throws unless every quoting fence's lines appear, in a row, in the file it names, at one
 * indentation, so an excerpt can't go stale when the example changes.
 */
export function assertExcerpts(source: string, mdxPath: string, id: string): void {
  for (const [, example = '', excerpt = ''] of source.matchAll(excerptBlock)) {
    const quoted = excerpt.trimEnd().split('\n');
    const lines = readFileSync(resolve(dirname(mdxPath), example), 'utf8').split('\n');
    const first = quoted[0] ?? '';
    const found = lines.some((line, start) => {
      if (!line.endsWith(first)) return false;
      const indent = line.slice(0, line.length - first.length);
      if (indent.trim()) return false;
      return quoted.every((want, offset) =>
        want ? lines[start + offset] === indent + want : !lines[start + offset]?.trim(),
      );
    });
    if (!found) {
      throw new Error(`${id}: an excerpt from ${example} doesn't match it; copy it again.`);
    }
  }
}
