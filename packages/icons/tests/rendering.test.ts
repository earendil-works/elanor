import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {Resvg} from "@resvg/resvg-js";
import pixelmatch from "pixelmatch";
import {describe, expect, test} from "vitest";
import {pipelineConfig} from "../config.js";
import {processSvg} from "../scripts/lib/pipeline.js";

const packageDirectory = resolve(import.meta.dirname, "..");
const representatives = ["search", "home", "settings"];
const sizes = [16, 32, 112];

describe("representative rendering", () => {
  for (const name of representatives) {
    test(`${name}: simplification stays visually bounded and SVGO changes no pixels`, async () => {
      const source = await readFile(resolve(packageDirectory, `sources/${name}.svg`), "utf8");
      const full = processSvg(source, pipelineConfig, `${name}.svg`);
      const unsimplified = processSvg(source, {
        ...pipelineConfig,
        simplification: {...pipelineConfig.simplification, enabled: false},
        optimization: {...pipelineConfig.optimization, enabled: false},
      });

      for (const size of sizes) {
        const beforeSvgo = render(full.beforeOptimization, size);
        const afterSvgo = render(full.svg, size);
        expect(pixelmatch(beforeSvgo, afterSvgo, undefined, size, size, {threshold: 0})).toBe(0);

        const detailed = render(unsimplified.svg, size);
        const changed = pixelmatch(detailed, afterSvgo, undefined, size, size, {threshold: 0.1});
        expect(changed / (size * size)).toBeLessThan(0.02);
      }
    });
  }
});

function render(svg: string, size: number): Uint8Array {
  return new Resvg(svg, {fitTo: {mode: "width", value: size}}).render().pixels;
}
