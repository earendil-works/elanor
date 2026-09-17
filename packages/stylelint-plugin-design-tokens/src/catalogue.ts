import { readFileSync } from "node:fs";
import path from "node:path";

export interface CatalogueToken {
  path: string;
  cssVariable: string;
  type: string;
  tier: string;
  description: string;
  deprecated: boolean | string;
  modes: Record<string, string>;
  sourceToken?: string;
}

export interface TokenCatalogue {
  schemaVersion: number;
  brand: string;
  tokens: CatalogueToken[];
}

export interface LoadedCatalogue extends TokenCatalogue {
  tokensByVariable: ReadonlyMap<string, CatalogueToken>;
}

const cache = new Map<string, LoadedCatalogue>();

/**
 * Loads a generated token catalogue and indexes its tokens by CSS variable.
 *
 * Catalogues are cached by absolute path after their first load.
 *
 * @param filename The path to the generated catalogue.
 * @returns The catalogue with a CSS-variable lookup map.
 */
export function loadCatalogue(filename: string): LoadedCatalogue {
  const absolutePath = path.resolve(filename);
  const cached = cache.get(absolutePath);
  if (cached) return cached;

  const catalogue = JSON.parse(readFileSync(absolutePath, "utf8")) as TokenCatalogue;
  if (catalogue.schemaVersion !== 1 || !Array.isArray(catalogue.tokens)) {
    throw new Error(`Unsupported token catalogue at ${absolutePath}. Expected schemaVersion 1.`);
  }

  const loaded: LoadedCatalogue = {
    ...catalogue,
    tokensByVariable: new Map(catalogue.tokens.map((token) => [token.cssVariable, token])),
  };
  cache.set(absolutePath, loaded);
  return loaded;
}
