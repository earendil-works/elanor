import type { Plugin } from "@terrazzo/parser";

export const RESOLVED_SCHEMA_VERSION = 1;
const GENERATION_EXTENSION_KEY = "com.earendil-works.generation";

export interface ResolvedToken {
  type: string;
  description: string;
  cssVariable: string | null;
  /** Fully resolved DTCG `$value` per color scheme. */
  modes: Record<"light" | "dark", unknown>;
  /** The token each mode's value ultimately comes from, when it is an alias. */
  aliasOf?: Record<"light" | "dark", string | null>;
  extensions?: Record<string, unknown>;
}

/**
 * Emits `tokens.resolved.json`: every token's resolved DTCG value per color
 * scheme, keyed by token path. Unlike the catalogue's CSS strings, values keep
 * their authored color space and hex, plus `$extensions` such as print builds.
 */
export function resolvedTokensPlugin(brand: string): Plugin {
  return {
    name: "@earendil-works/token-resolved",
    enforce: "post",
    build(options): void {
      const light = options.resolver.apply({ colorScheme: "light" });
      const dark = options.resolver.apply({ colorScheme: "dark" });
      const cssVariables = new Map(
        options
          .getTransforms({ format: "css", input: { colorScheme: "light" } })
          .map((transform) => [transform.token.id, transform.localID ?? null]),
      );

      const tokens: Record<string, ResolvedToken> = {};
      for (const id of Object.keys(light).sort()) {
        const token = light[id]!;
        const darkToken = dark[id] ?? token;
        const aliasOf = { light: token.aliasOf ?? null, dark: darkToken.aliasOf ?? null };
        const extensions = { ...(token.$extensions ?? {}) } as Record<string, unknown>;
        delete extensions[GENERATION_EXTENSION_KEY];
        tokens[id] = {
          type: token.$type,
          description: token.$description ?? "",
          cssVariable: cssVariables.get(id) ?? null,
          modes: { light: token.$value, dark: darkToken.$value },
          ...(aliasOf.light || aliasOf.dark ? { aliasOf } : {}),
          ...(Object.keys(extensions).length > 0 ? { extensions } : {}),
        };
      }

      options.outputFile(
        "tokens.resolved.json",
        `${JSON.stringify({ schemaVersion: RESOLVED_SCHEMA_VERSION, brand, tokens }, null, 2)}\n`,
      );
    },
  };
}
