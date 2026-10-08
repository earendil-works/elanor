import type {BuildHookOptions, Plugin, TokenTransformed} from '@terrazzo/parser';

export const CATALOGUE_SCHEMA_VERSION = 1;
const GENERATION_EXTENSION_KEY = 'com.earendil-works.generation';

type ColorScheme = 'light' | 'dark';

export interface CatalogueEntry {
  path: string;
  cssVariable: string;
  type: string;
  tier: string;
  description: string;
  deprecated: boolean | string;
  /** Resolved CSS value per color scheme. */
  modes: Record<ColorScheme, string>;
  /** Resolved DTCG `$value` per color scheme, e.g. a color with its `hex`. */
  values: Record<ColorScheme, unknown>;
  /** The token each scheme's value ultimately aliases, when it is an alias. */
  aliasOf?: Record<ColorScheme, string | null>;
  /** The token's `$extensions`, such as print builds of key colors. */
  extensions?: Record<string, unknown>;
  sourceToken?: string;
}

export interface TokenCatalogue {
  schemaVersion: number;
  brand: string;
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

function modeVariables(
  transforms: TokenTransformed[],
): Map<string, ReturnType<typeof cssVariablesFor>[number]> {
  const result = new Map<string, ReturnType<typeof cssVariablesFor>[number]>();
  for (const transform of transforms) {
    for (const variable of cssVariablesFor(transform)) result.set(variable.name, variable);
  }
  return result;
}

function resolvedModeValues(variables: ReadonlyMap<string, {value: string}>): Map<string, string> {
  const raw = new Map([...variables].map(([name, variable]) => [name, variable.value]));
  return new Map([...raw].map(([name, value]) => [name, resolveValue(value, raw)]));
}

export function cataloguePlugin(brand: string): Plugin {
  return {
    name: '@earendil-works/token-catalogue',
    enforce: 'post',
    build(options): void {
      const lightTransforms = transformsFor(options, {colorScheme: 'light'});
      const darkTransforms = transformsFor(options, {colorScheme: 'dark'});
      const lightVariables = modeVariables(lightTransforms);
      // The CSS dark permutation intentionally contains only semantic color
      // overrides. Merge it over the complete light set to model the cascade.
      const darkVariables = new Map(lightVariables);
      for (const [name, variable] of modeVariables(darkTransforms))
        darkVariables.set(name, variable);
      const lightValues = resolvedModeValues(lightVariables);
      const darkValues = resolvedModeValues(darkVariables);
      const resolved = {
        light: options.resolver.apply({colorScheme: 'light'}),
        dark: options.resolver.apply({colorScheme: 'dark'}),
      };

      const tokens: CatalogueEntry[] = [];
      for (const [cssVariable, variable] of [...lightVariables].sort(([a], [b]) =>
        a.localeCompare(b),
      )) {
        const darkVariable = darkVariables.get(cssVariable);
        if (!darkVariable) throw new Error(`Missing dark-mode value for ${cssVariable}.`);

        // Prefer the transform whose localID is exactly this custom property.
        // Only composite subproperties (e.g. `--…-font-size` emitted by a
        // typography composite) fall back to a prefix match, using the longest
        // matching localID so nested composites win over their parents.
        const exactTransform = lightTransforms.find(
          (candidate) => cssVariable === candidate.localID,
        );
        const prefixTransform = exactTransform
          ? undefined
          : lightTransforms
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
        const resolvedToken = (scheme: ColorScheme) => {
          const entry = resolved[scheme][token.id];
          if (!entry) throw new Error(`Missing ${scheme} resolver value for ${token.id}.`);
          return entry;
        };
        const dtcgValue = (scheme: ColorScheme): unknown => {
          const value = resolvedToken(scheme).$value;
          return subvalue === undefined ? value : (value as Record<string, unknown>)[subvalue];
        };
        // A token that is not an alias has no aliasOf; null records that explicitly.
        const aliasOf =
          subvalue === undefined
            ? {
                light: resolvedToken('light').aliasOf ?? null,
                dark: resolvedToken('dark').aliasOf ?? null,
              }
            : {light: null, dark: null};
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
          modes: {
            light: lightValues.get(cssVariable) ?? variable.value,
            dark: darkValues.get(cssVariable) ?? darkVariable.value,
          },
          values: {light: dtcgValue('light'), dark: dtcgValue('dark')},
          ...(aliasOf.light || aliasOf.dark ? {aliasOf} : {}),
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
        tokens,
      };

      options.outputFile('tokens.catalog.json', `${JSON.stringify(catalogue, null, 2)}\n`);
    },
  };
}
