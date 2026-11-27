import {readFileSync} from 'node:fs';
import {dirname, posix, relative, resolve, sep} from 'node:path';

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

/** `relative()` with `/` on every platform, for specifiers and names. */
const relativePath = (from: string, to: string) => relative(from, to).split(sep).join(posix.sep);

const isCss = (file: DemoFile) => file.name.endsWith('.css');

const localImport = /^import\s+(?:[^'"]+\s+from\s+)?'(\.\.?\/[^']+)';$/gm;

/** The example file followed by the local files it imports, with CSS Modules last. */
export function demoFiles(mdxPath: string, example: string): DemoFile[] {
  const page = dirname(mdxPath);
  const files: DemoFile[] = [];
  const visit = (path: string) => {
    if (files.some((file) => file.path === path)) return;
    const code = readFileSync(path, 'utf8');
    const specifier = `./${relativePath(page, path)}`;
    files.push({specifier, path, name: relativePath(resolve(page, 'examples'), path), code});
    for (const [, local] of code.matchAll(localImport)) {
      if (local) visit(resolve(dirname(path), local));
    }
  };
  visit(resolve(page, example));
  return [...files.filter((file) => !isCss(file)), ...files.filter(isCss)];
}

/** Throws if `<Demo` is used in any form other than {@link demoBlock}. */
export function assertDemoSyntax(source: string, id: string): void {
  const all = source.match(/<Demo\b[^>]*>/g) ?? [];
  const valid = source.match(demoBlock) ?? [];
  if (all.length !== valid.length) {
    throw new Error(`${id}: write demos as <Demo example="./examples/name.tsx" /> on one line.`);
  }
}

/** Opens a code fence quoting an example, such as ```` ```tsx from="./examples/demo.tsx" ````. */
const excerptOpening = /^```\w+ from="(\.\/examples\/[\w/.-]+)"$/;
/** Any line that opens a fence and mentions `from=`, to catch excerpts in another form. */
const excerptLike = /^\s*(?:`{3,}|~{3,}).*\bfrom=/;

/**
 * Throws unless every quoting fence is in the form of {@link excerptOpening} and its lines appear,
 * in a row, in the file it names, at one indentation, so an excerpt can't go stale.
 */
export function assertExcerpts(source: string, mdxPath: string): void {
  const lines = source.split('\n');
  lines.forEach((line, index) => {
    if (!excerptLike.test(line)) return;
    const at = `${mdxPath}:${index + 1}`;
    const example = excerptOpening.exec(line)?.[1];
    if (!example) {
      throw new Error(`${at}: open an excerpt as \`\`\`tsx from="./examples/name.tsx" on its own.`);
    }
    const end = lines.indexOf('```', index + 1);
    const quoted = lines.slice(index + 1, end);
    if (end === -1 || !quoted.some((want) => want.trim())) {
      throw new Error(`${at}: the excerpt from ${example} is empty or not closed.`);
    }
    const file = readFileSync(resolve(dirname(mdxPath), example), 'utf8').split('\n');
    const first = quoted[0] ?? '';
    const found = file.some((fileLine, start) => {
      const indent = fileLine.slice(0, fileLine.length - first.length);
      if (!first || !fileLine.endsWith(first) || indent.trim()) return false;
      return quoted.every((want, offset) =>
        want ? file[start + offset] === indent + want : !file[start + offset]?.trim(),
      );
    });
    if (!found) {
      throw new Error(`${at}: the excerpt from ${example} doesn't match it; copy it again.`);
    }
  });
}

/**
 * Throws unless the page's demos and excerpts are well formed and match the example files, as
 * `pnpm check` and the docs build both require.
 */
export function assertDemos(source: string, mdxPath: string): void {
  assertDemoSyntax(source, mdxPath);
  assertExcerpts(source, mdxPath);
  for (const [, example = ''] of source.matchAll(demoBlock)) {
    try {
      demoFiles(mdxPath, example);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`${mdxPath}: the demo ${example}: ${reason}`, {cause: error});
    }
  }
}
