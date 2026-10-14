import {readFileSync} from 'node:fs';
import {basename, dirname, resolve} from 'node:path';

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
  /** File name shown above the code, such as `demo.tsx`. */
  readonly name: string;
  readonly code: string;
}

const localImport = /^import\s+(?:[^'"]+\s+from\s+)?'(\.\/[^']+)';$/gm;

/** The example file followed by the local files it imports, such as CSS Modules. */
export function demoFiles(mdxPath: string, example: string): DemoFile[] {
  const files: DemoFile[] = [];
  const visit = (specifier: string) => {
    const path = resolve(dirname(mdxPath), specifier);
    if (files.some((file) => file.path === path)) return;
    const code = readFileSync(path, 'utf8');
    files.push({specifier, path, name: basename(path), code});
    for (const [, local] of code.matchAll(localImport)) {
      if (local) visit(`./examples/${local.slice(2)}`);
    }
  };
  visit(example);
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
