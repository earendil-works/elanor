import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";
import figmaJson from "terrazzo-plugin-figma-json";
import { cataloguePlugin } from "./scripts/catalogue-plugin";
import { resolvedTokensPlugin } from "./scripts/resolved-plugin";
import { cssPermutations } from "./terrazzo.shared.config";

export default defineConfig({
  tokens: ["./tokens/lefos.resolver.json"],
  outDir: "./dist/lefos/",
  plugins: [
    css({
      filename: "tokens.css",
      permutations: cssPermutations,
    }),
    figmaJson({
      filename: "tokens.figma.json",
      preserveReferences: true,
    }),
    cataloguePlugin("lefos"),
    resolvedTokensPlugin("lefos"),
  ],
  lint: {
    rules: {},
  },
});
