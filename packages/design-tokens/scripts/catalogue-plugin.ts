import type {
  BuildHookOptions,
  Plugin,
  TokenNormalizedSet,
  TokenTransformed,
} from '@terrazzo/parser';

import {contextActivation} from '../terrazzo.shared.config';

export const CATALOGUE_SCHEMA_VERSION = 2;
const GENERATION_EXTENSION_KEY = 'com.earendil-works.generation';

/** A token's value in one modifier context. */
export interface CatalogueContextValue {
  /** Resolved CSS value. */
  css: string;
  /** Resolved DTCG `$value`, e.g. a color with its `hex`. */
  value: unknown;
  /** The token the value ultimately aliases, when it is an alias. */
  aliasOf?: string;
}

export interface CatalogueEntry extends CatalogueContextValue {
  path: string;
  cssVariable: string;
  type: string;
  tier: string;
  description: string;
  deprecated: boolean | string;
  /**
   * Values that differ from the default (`css`, `value`, `aliasOf`, with every
   * modifier at its default context), by modifier and context.
   */
  contexts?: Record<string, Record<string, CatalogueContextValue>>;
  /** The token's `$extensions`, such as print builds of key colors. */
  extensions?: Record<string, unknown>;
  sourceToken?: string;
}

export interface CatalogueModifier {
  default: string;
  contexts: string[];
  /** How the CSS output switches on each non-default context. */
  css: Record<string, string>;
}

export interface TokenCatalogue {
  schemaVersion: number;
  brand: string;
  modifiers: Record<string, CatalogueModifier>;
  tokens: CatalogueEntry[];
}

const SUBVALUE_TYPES: Record<string, string> = {
  color: 'color',
  'font-family': 'fontFamily',
  'font-size': 'dimension',
  'font-weight': 'fontWeight',
  'letter-spacing': 'dimension',
  'line-height': 'number',
};

const SUBVALUE_PATHS: Record<string, string> = {
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'font-weight': 'fontWeight',
  'letter-spacing': 'letterSpacing',
  'line-height': 'lineHeight',
};

function tierFor(path: string): string {
  return path.split('.', 1)[0] ?? 'unknown';
}

function transformsFor(
  options: BuildHookOptions,
  input: Record<string, string>,
): TokenTransformed[] {
  return options.getTransforms({format: 'css', input});
}

function cssVariablesFor(transform: TokenTransformed): Array<{
  name: string;
  path: string;
  type: string;
  value: string;
}> {
  const localID = transform.localID;
  if (!localID) return [];

  if (transform.type === 'SINGLE_VALUE') {
    return [
      {
        name: localID,
        path: transform.token.id,
        type: transform.token.$type,
        value: transform.value,
      },
    ];
  }

  const variables: Array<{
    name: string;
    path: string;
    type: string;
    value: string;
  }> = [];

  const shorthand =
    transform.value['.'] ??
    (transform.token.$type === 'typography'
      ? `var(${localID}-font-weight) var(${localID}-font-size)/var(${localID}-line-height) var(${localID}-font-family)`
      : undefined);
  if (shorthand) {
    variables.push({
      name: localID,
      path: transform.token.id,
      type: transform.token.$type,
      value: shorthand,
    });
  }

  for (const [subvalue, value] of Object.entries(transform.value)) {
    if (subvalue === '.' || subvalue === 'p3' || subvalue === 'rec2020' || subvalue === 'srgb')
      continue;
    variables.push({
      name: `${localID}-${subvalue}`,
      path: `${transform.token.id}.${SUBVALUE_PATHS[subvalue] ?? subvalue}`,
      type: SUBVALUE_TYPES[subvalue] ?? transform.token.$type,
      value,
    });
  }

  // CSS colors can be represented as a multi-gamut value but emit one custom
  // property name. Use the sRGB value as the catalogue's portable fallback.
  if (!variables.length && transform.value.srgb) {
    variables.push({
      name: localID,
      path: transform.token.id,
      type: transform.token.$type,
      value: transform.value.srgb,
    });
  }

  return variables;
}

function resolveValue(
  value: string,
  values: ReadonlyMap<string, string>,
  stack = new Set<string>(),
): string {
  return value.replace(/var\((--[A-Za-z0-9_-]+)\)/g, (match, name: string) => {
    if (stack.has(name)) return match;
    const referenced = values.get(name);
    if (referenced === undefined) return match;
    const nextStack = new Set(stack);
    nextStack.add(name);
    return resolveValue(referenced, values, nextStack);
  });
}

function contextVariables(
  transforms: TokenTransformed[],
  base: ReadonlyMap<string, ReturnType<typeof cssVariablesFor>[number]> = new Map(),
): Map<string, ReturnType<typeof cssVariablesFor>[number]> {
  const result = new Map(base);
  for (const transform of transforms) {
    for (const variable of cssVariablesFor(transform)) result.set(variable.name, variable);
  }
  return result;
}

function resolvedContextValues(
  variables: ReadonlyMap<string, {value: string}>,
): Map<string, string> {
  const raw = new Map([...variables].map(([name, variable]) => [name, variable.value]));
  return new Map([...raw].map(([name, value]) => [name, resolveValue(value, raw)]));
}

/** CSS variables, resolved CSS values, and resolved tokens for one resolver input. */
interface ContextState {
  variables: Map<string, ReturnType<typeof cssVariablesFor>[number]>;
  values: Map<string, string>;
  resolved: TokenNormalizedSet;
}

function contextState(
  options: BuildHookOptions,
  input: Record<string, string>,
  base?: ContextState,
): ContextState {
  // A non-default CSS permutation contains only the tokens it overrides. Merge
  // it over the complete default set to model the cascade.
  const variables = contextVariables(transformsFor(options, input), base?.variables);
  return {
    variables,
    values: resolvedContextValues(variables),
    resolved: options.resolver.apply(input),
  };
}

function sameValue(a: CatalogueContextValue, b: CatalogueContextValue): boolean {
  return (
    a.css === b.css &&
    a.aliasOf === b.aliasOf &&
    JSON.stringify(a.value) === JSON.stringify(b.value)
  );
}

export function cataloguePlugin(brand: string): Plugin {
  return {
    name: '@earendil-works/token-catalogue',
    enforce: 'post',
    build(options): void {
      const modifiers: Record<string, CatalogueModifier> = {};
      for (const modifier of Object.values(options.resolver.source.modifiers ?? {})) {
        if (!modifier.default) throw new Error(`Modifier ${modifier.name} has no default context.`);
        const contexts = Object.keys(modifier.contexts);
        const css: Record<string, string> = {};
        for (const context of contexts) {
          if (context === modifier.default) continue;
          const note = contextActivation[modifier.name]?.[context];
          if (!note)
            throw new Error(
              `Missing CSS activation note for ${modifier.name}.${context} in terrazzo.shared.config.ts.`,
            );
          css[context] = note;
        }
        modifiers[modifier.name] = {default: modifier.default, contexts, css};
      }

      const defaults = Object.fromEntries(
        Object.entries(modifiers).map(([name, modifier]) => [name, modifier.default]),
      );
      const defaultTransforms = transformsFor(options, defaults);
      const defaultState = contextState(options, defaults);
      const contextStates = Object.entries(modifiers).flatMap(([name, modifier]) =>
        Object.keys(modifier.css).map((context) => ({
          modifier: name,
          context,
          state: contextState(options, {...defaults, [name]: context}, defaultState),
        })),
      );

      const tokens: CatalogueEntry[] = [];
      for (const [cssVariable, variable] of [...defaultState.variables].sort(([a], [b]) =>
        a.localeCompare(b),
      )) {
        // Prefer the transform whose localID is exactly this custom property.
        // Only composite subproperties (e.g. `--…-font-size` emitted by a
        // typography composite) fall back to a prefix match, using the longest
        // matching localID so nested composites win over their parents.
        const exactTransform = defaultTransforms.find(
          (candidate) => cssVariable === candidate.localID,
        );
        const prefixTransform = exactTransform
          ? undefined
          : defaultTransforms
              .filter(
                (candidate) => candidate.localID && cssVariable.startsWith(`${candidate.localID}-`),
              )
              .sort((a, b) => (b.localID?.length ?? 0) - (a.localID?.length ?? 0))
              .at(0);
        const token = (exactTransform ?? prefixTransform)?.token;
        if (!token) throw new Error(`Could not find token metadata for ${cssVariable}.`);

        // Composite subproperties (`<token>.fontSize`) take their part of the
        // composite value; aliases and extensions describe whole tokens only.
        const subvalue =
          variable.path === token.id ? undefined : variable.path.slice(token.id.length + 1);
        const valueIn = (state: ContextState): CatalogueContextValue => {
          const resolved = state.resolved[token.id];
          if (!resolved) throw new Error(`Missing resolver value for ${token.id}.`);
          const css = state.values.get(cssVariable) ?? state.variables.get(cssVariable)?.value;
          if (css === undefined) throw new Error(`Missing CSS value for ${cssVariable}.`);
          const value =
            subvalue === undefined
              ? resolved.$value
              : (resolved.$value as Record<string, unknown>)[subvalue];
          const aliasOf = subvalue === undefined ? resolved.aliasOf : undefined;
          return {css, value, ...(aliasOf ? {aliasOf} : {})};
        };

        const base = valueIn(defaultState);
        const contexts: Record<string, Record<string, CatalogueContextValue>> = {};
        for (const {modifier, context, state} of contextStates) {
          const value = valueIn(state);
          if (sameValue(value, base)) continue;
          contexts[modifier] = {...contexts[modifier], [context]: value};
        }
        // Contexts are recorded per modifier, so a value that depends on a
        // combination of modifiers cannot be represented yet.
        if (Object.keys(contexts).length > 1)
          throw new Error(
            `${variable.path} varies under more than one modifier (${Object.keys(contexts).join(', ')}); the catalogue models modifiers independently.`,
          );

        const extensions: Record<string, unknown> =
          subvalue === undefined ? {...token.$extensions} : {};
        delete extensions[GENERATION_EXTENSION_KEY];

        tokens.push({
          path: variable.path,
          cssVariable,
          type: variable.type,
          tier: tierFor(token.id),
          description: token.$description ?? '',
          deprecated: token.$deprecated ?? false,
          ...base,
          ...(Object.keys(contexts).length > 0 ? {contexts} : {}),
          ...(Object.keys(extensions).length > 0 ? {extensions} : {}),
          ...(variable.path === token.id ? {} : {sourceToken: token.id}),
        });
      }

      const names = new Set<string>();
      for (const token of tokens) {
        if (names.has(token.cssVariable))
          throw new Error(`Duplicate catalogue custom property ${token.cssVariable}.`);
        names.add(token.cssVariable);
      }

      const catalogue: TokenCatalogue = {
        schemaVersion: CATALOGUE_SCHEMA_VERSION,
        brand,
        modifiers,
        tokens,
      };

      options.outputFile('tokens.catalog.json', `${JSON.stringify(catalogue, null, 2)}\n`);
    },
  };
}
