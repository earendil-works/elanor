import {renderPng, tightFrame} from "../lib/raster.js";
import type {AssetSelector, ExportPlugin} from "./plugin.js";

export interface PngHeightsOptions {
  /** Output folder and manifest key, e.g. `email-signature`. */
  name: string;
  select: AssetSelector;
  heights: number[];
}

/** Fixed-height PNGs, e.g. for email signatures. */
export function pngHeights(options: PngHeightsOptions): ExportPlugin {
  return {
    name: options.name,
    async run(context) {
      for (const asset of context.select(options.select)) {
        const entries = [];
        for (const height of options.heights) {
          const width = Math.round((height * asset.colored.width) / asset.colored.height);
          const png = await renderPng(asset.colored, tightFrame(asset.colored, width, height));
          entries.push({height, path: await context.write(`${options.name}/${asset.brand}/${asset.id}-${height}px.png`, png)});
        }
        context.assetManifest(asset).files[options.name] = entries;
      }
    },
  };
}
