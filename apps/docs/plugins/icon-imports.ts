import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

import MagicString from 'magic-string';
import {parseSync, type Plugin} from 'vite';

const packageName = '@earendil-works/elanor-icons-boiled-react';
const barrelPath = fileURLToPath(
  new URL('../../../packages/icons/boiled/react/dist/index.js', import.meta.url),
);

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

/** Component names by icon file name (`search` → `SearchIcon`), read from the generated barrel at `barrel`. */
export function iconComponentNames(barrel: string): Map<string, string> {
  const names = new Map<string, string>();
  for (const [component, path] of iconExportPaths(readFileSync(barrel, 'utf8'))) {
    names.set(path.slice(`${packageName}/`.length), component);
  }
  return names;
}

function parseModule(code: string, id: string) {
  const {program, errors} = parseSync(id, code, {lang: 'js', sourceType: 'module'});
  const [error] = errors;
  if (error) throw new Error(`Cannot parse ${id}: ${error.message}`);
  return program;
}

export function iconExportPaths(barrel: string): Map<string, string> {
  const paths = new Map<string, string>();
  for (const node of parseModule(barrel, barrelPath).body) {
    if (node.type !== 'ExportNamedDeclaration' || !node.source) continue;
    const path = `${packageName}/${node.source.value.replace(/^\.\//, '').replace(/\.js$/, '')}`;
    for (const specifier of node.specifiers) {
      const name =
        specifier.exported.type === 'Identifier'
          ? specifier.exported.name
          : String(specifier.exported.value);
      paths.set(name, path);
    }
  }
  return paths;
}

export function rewriteIconImports(code: string, id: string, paths: Map<string, string>) {
  const output = new MagicString(code);
  for (const node of parseModule(code, id).body) {
    if (node.type !== 'ImportDeclaration' && node.type !== 'ExportNamedDeclaration') continue;
    if (node.source?.value !== packageName || node.specifiers.length === 0) continue;
    // Namespace/default imports cannot be narrowed without changing semantics.
    if (
      node.specifiers.some(
        (specifier) => specifier.type !== 'ImportSpecifier' && specifier.type !== 'ExportSpecifier',
      )
    )
      continue;
    const statements = node.specifiers.map((specifier) => {
      const symbol = specifier.type === 'ImportSpecifier' ? specifier.imported : specifier.local;
      const name = symbol.type === 'Identifier' ? symbol.name : String(symbol.value);
      const path = paths.get(name);
      if (!path) throw new Error(`Unknown Elanor icon export: ${name}`);
      const keyword = node.type === 'ImportDeclaration' ? 'import' : 'export';
      const {start, end} = specifier;
      return `${keyword} {${code.slice(start, end)}} from ${JSON.stringify(path)};`;
    });
    const {start, end} = node;
    output.overwrite(start, end, statements.join('\n'));
  }
  if (!output.hasChanged()) return;
  return {
    code: output.toString(),
    map: output.generateMap({source: id, includeContent: true, hires: true}),
  };
}
