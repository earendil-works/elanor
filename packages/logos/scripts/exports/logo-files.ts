import {serializeSvg} from "../lib/compose.js";
import {renderPng, tightFrame} from "../lib/raster.js";
import type {Asset, AssetSelector, ExportPlugin} from "./plugin.js";

export interface LogoFilesOptions {
  select?: AssetSelector;
  formats: Array<"svg" | "png">;
  /** PNGs render at `scale` pixels per source unit, capped so neither side exceeds `maxDimension`. */
  png: {scale: number; maxDimension: number};
}

const kitPath = (asset: Asset, extension: string) =>
  `kits/${asset.brand}/${asset.kind}/${asset.treatment.id}/${asset.id}.${extension}`;

/** Logo files for the press kit folders. */
export function logoFiles(options: LogoFilesOptions): ExportPlugin {
  return {
    name: "logo-files",
    async run(context) {
      for (const asset of context.select(options.select)) {
        const files = context.assetManifest(asset).files;
        if (options.formats.includes("svg")) files.kitSvg = await context.write(kitPath(asset, "svg"), serializeSvg(asset.colored));
        if (options.formats.includes("png")) {
          const {width, height} = asset.colored;
          const scale = Math.min(options.png.scale, options.png.maxDimension / Math.max(width, height));
          const png = await renderPng(asset.colored, tightFrame(asset.colored, Math.round(width * scale), Math.round(height * scale)));
          files.png = await context.write(kitPath(asset, "png"), png);
        }
      }
    },
  };
}
