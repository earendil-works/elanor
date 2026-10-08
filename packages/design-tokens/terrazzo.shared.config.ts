import type {Permutation} from '@terrazzo/plugin-css';

const SEMANTIC_COLOR_TOKEN_PATTERN = 'semantic.color.**';

/**
 * Indents generated CSS declarations for use inside nested rule blocks.
 *
 * @param contents The declarations emitted by the CSS plugin.
 * @param level The number of two-space indentation levels.
 * @returns The declarations with nonempty lines indented.
 */
function indentDeclarations(contents: string, level = 1): string {
  const result: string[] = [];
  const indentation = '  '.repeat(level);

  for (const line of contents.split('\n')) {
    result.push(line ? `${indentation}${line.trimStart()}` : line);
  }

  return result.join('\n');
}

/**
 * Wraps mode-independent declarations in the root selector.
 *
 * @param contents The declarations emitted by the CSS plugin.
 * @returns A complete root CSS rule.
 */
function prepareBaseCss(contents: string): string {
  return `:root {\n  color-scheme: light dark;\n${indentDeclarations(contents)}\n}\n\n:root[data-color-scheme="light"] {\n  color-scheme: light;\n}`;
}

/**
 * Wraps dark color-scheme declarations for automatic and explicit selection.
 *
 * The declarations are intentionally repeated so consumers can override the
 * system preference without JavaScript-generated token values.
 *
 * @param contents The declarations emitted by the CSS plugin.
 * @returns Root CSS rules for automatic and explicit dark color schemes.
 */
function prepareDarkColorSchemeCss(contents: string): string {
  return `@media (prefers-color-scheme: dark) {\n  :root:not([data-color-scheme]) {\n    color-scheme: dark;\n${indentDeclarations(contents, 2)}\n  }\n}\n\n:root[data-color-scheme="dark"] {\n  color-scheme: dark;\n${indentDeclarations(contents)}\n}`;
}

/**
 * Shared resolver permutations for every brand CSS build.
 *
 * Foundations, mode-independent semantic tokens, and the default light
 * semantic colors are emitted at the root. Dark semantic colors are emitted
 * for both the system preference and an explicit `data-color-scheme` override.
 */
export const cssPermutations: Permutation[] = [
  {
    input: {},
    prepare: prepareBaseCss,
  },
  {
    input: {colorScheme: 'dark'},
    include: [SEMANTIC_COLOR_TOKEN_PATTERN],
    prepare: prepareDarkColorSchemeCss,
  },
];
