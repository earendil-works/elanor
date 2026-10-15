import type {Permutation} from '@terrazzo/plugin-css';

const SEMANTIC_COLOR_TOKEN_PATTERN = 'semantic.color.**';
const MOVEMENT_TRANSITION_TOKEN_PATTERN = 'semantic.transition.movement.**';
const CONTEXTUAL_TYPOGRAPHY_TOKEN_PATTERNS = [
  'semantic.typography.primary',
  'semantic.typography.secondary',
];
const TRANSITION_PARTS = {
  duration: 'duration',
  delay: 'delay',
  timingFunction: 'timing-function',
} as const;

/**
 * Emits each transition as one custom property per part plus the shorthand,
 * like typography, so components can use a part on its own, such as the
 * duration in `calc()`. Semantic transitions alias primitives for every part.
 *
 * @param token The token to transform.
 * @param options The CSS transform options.
 * @returns The part values, or `undefined` for other token types.
 * @throws When a transition part is a literal instead of an alias.
 */
const transformTransitionParts: NonNullable<Permutation['transform']> = (token, options) => {
  if (token.$type !== 'transition') return undefined;
  const {transformAlias} = options;
  if (!transformAlias) throw new Error('The CSS plugin passed no alias transform.');
  const parts: Record<string, string> = {};
  for (const [key, name] of Object.entries(TRANSITION_PARTS)) {
    const alias = token.partialAliasOf?.[key as keyof typeof TRANSITION_PARTS];
    const aliased = alias ? options.tokensSet[alias] : undefined;
    if (!aliased) throw new Error(`${token.id}.${key} must alias a primitive token.`);
    parts[name] = transformAlias(aliased);
  }
  return parts;
};

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
 * Wraps prose text-context declarations for elements that opt into prose.
 *
 * Context-dependent typography resolves to UI styles at the root; any element
 * with `data-text-context="prose"` redefines it for its subtree.
 *
 * @param contents The declarations emitted by the CSS plugin.
 * @returns A CSS rule scoped to the prose text context.
 */
function prepareProseTextContextCss(contents: string): string {
  return `[data-text-context="prose"] {\n${indentDeclarations(contents)}\n}`;
}

/**
 * Wraps reduced-motion declarations in the reduced-motion media query.
 *
 * Transitions that move content resolve to their default timing at the root
 * and become instant when the reader prefers reduced motion.
 *
 * @param contents The declarations emitted by the CSS plugin.
 * @returns A root CSS rule scoped to the reduced-motion preference.
 */
function prepareReducedMotionCss(contents: string): string {
  return `@media (prefers-reduced-motion: reduce) {\n  :root {\n${indentDeclarations(contents, 2)}\n  }\n}`;
}

/**
 * How the CSS output switches on each non-default modifier context, recorded
 * in the token catalogue. Keep these in step with `cssPermutations`.
 */
export const contextActivation: Record<string, Record<string, string>> = {
  colorScheme: {
    dark: '@media (prefers-color-scheme: dark) on :root without data-color-scheme, or :root[data-color-scheme="dark"]',
  },
  textContext: {
    prose: '[data-text-context="prose"] on the element that contains long-form content',
  },
  motion: {
    reduced: '@media (prefers-reduced-motion: reduce) on :root',
  },
};

/**
 * Shared resolver permutations for every brand CSS build.
 *
 * Foundations, mode-independent semantic tokens, and the default light
 * semantic colors are emitted at the root. Dark semantic colors are emitted
 * for both the system preference and an explicit `data-color-scheme` override.
 * Context-dependent typography defaults to the UI context at the root and is
 * redefined under `data-text-context="prose"`. Transitions that move content
 * are redefined as instant under
 * `prefers-reduced-motion: reduce`.
 */
export const cssPermutations: Permutation[] = [
  {
    input: {},
    prepare: prepareBaseCss,
    transform: transformTransitionParts,
  },
  {
    input: {colorScheme: 'dark'},
    include: [SEMANTIC_COLOR_TOKEN_PATTERN],
    prepare: prepareDarkColorSchemeCss,
    transform: transformTransitionParts,
  },
  {
    input: {textContext: 'prose'},
    include: CONTEXTUAL_TYPOGRAPHY_TOKEN_PATTERNS,
    prepare: prepareProseTextContextCss,
    transform: transformTransitionParts,
  },
  {
    input: {motion: 'reduced'},
    include: [MOVEMENT_TRANSITION_TOKEN_PATTERN],
    prepare: prepareReducedMotionCss,
    transform: transformTransitionParts,
  },
];
