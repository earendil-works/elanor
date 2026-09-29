import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import MagicString from 'magic-string';
import {parseAst, type Plugin} from 'vite';

// Rollup attaches offsets at runtime, but nested ESTree node types omit them.
type Positioned<T> = T & {start: number; end: number};

const packageName = '@earendil-works/elanor-icons-react';
const barrelPath = fileURLToPath(new URL('../../../packages/icons/react/dist/index.js', import.meta.url));

// Keep the public barrel API, but bypass its unused re-exports in native-ESM dev.
// Read the generated exports rather than guessing filenames from component names.
export function iconImports(): Plugin {
  let paths: Map<string, string> | undefined;

  return {
    name: 'elanor-icon-imports',
    apply: 'serve',
    enforce: 'post', // Parse JavaScript after Astro/MDX/TSX compilation.
    watchChange(id) {
      if (id === barrelPath) paths = undefined;
    },
    transform(code, id) {
      if (!code.includes(packageName)) return;
      this.addWatchFile(barrelPath);
      paths ??= iconExportPaths(readFileSync(barrelPath, 'utf8'));
      return rewriteIconImports(code, id, paths);
    },
  };
}

export function iconExportPaths(barrel: string): Map<string, string> {
  const paths = new Map<string, string>();
  for (const node of parseAst(barrel).body) {
    if (node.type !== 'ExportNamedDeclaration' || typeof node.source?.value !== 'string') continue;
    const path = `${packageName}/${node.source.value.replace(/^\.\//, '').replace(/\.js$/, '')}`;
    for (const specifier of node.specifiers) {
      const name = specifier.exported.type === 'Identifier' ? specifier.exported.name : String(specifier.exported.value);
      paths.set(name, path);
    }
  }
  return paths;
}

export function rewriteIconImports(code: string, id: string, paths: Map<string, string>) {
  const output = new MagicString(code);
  for (const node of parseAst(code).body) {
    if (node.type !== 'ImportDeclaration' && node.type !== 'ExportNamedDeclaration') continue;
    if (node.source?.value !== packageName || node.specifiers.length === 0) continue;
    // Namespace/default imports cannot be narrowed without changing semantics.
    if (node.specifiers.some((specifier) => specifier.type !== 'ImportSpecifier' && specifier.type !== 'ExportSpecifier')) continue;
    const statements = node.specifiers.map((specifier) => {
      const symbol = specifier.type === 'ImportSpecifier' ? specifier.imported : specifier.local;
      const name = symbol.type === 'Identifier' ? symbol.name : String(symbol.value);
      const path = paths.get(name);
      if (!path) throw new Error(`Unknown Elanor icon export: ${name}`);
      const keyword = node.type === 'ImportDeclaration' ? 'import' : 'export';
      const {start, end} = specifier as Positioned<typeof specifier>;
      return `${keyword} {${code.slice(start, end)}} from ${JSON.stringify(path)};`;
    });
    const {start, end} = node as Positioned<typeof node>;
    output.overwrite(start, end, statements.join('\n'));
  }
  if (!output.hasChanged()) return;
  return {code: output.toString(), map: output.generateMap({source: id, includeContent: true, hires: true})};
}
