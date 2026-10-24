import {serializeSvg} from '../lib/compose.js';
import {renderPng, tightFrame} from '../lib/raster.js';
import type {Asset, AssetSelector, ExportPlugin} from './plugin.js';

export interface LogoFilesOptions {
  /** The formats to write, each for the assets its selector picks. */
  formats: Partial<Record<'svg' | 'png', AssetSelector>>;
  /** PNGs render at `scale` pixels per source unit, capped so neither side exceeds `maxDimension`. */
  png: {scale: number; maxDimension: number};
}

const kitPath = (asset: Asset, extension: string) =>
  `kits/${asset.brand}/${asset.kind}/${asset.treatment.id}/${asset.id}.${extension}`;

/** Logo files for the press kits, in `kits/<brand>/<kind>/<treatment>/`. */
export function logoFiles(options: LogoFilesOptions): ExportPlugin {
  return {
    name: 'logo-files',
    kitContents: `its logos as ${Object.keys(options.formats)
      .map((format) => format.toUpperCase())
      .join(' and ')}`,
    async run(context) {
      const {svg, png} = options.formats;
      for (const asset of svg ? context.select(svg) : []) {
        context.assetManifest(asset).files.kitSvg = await context.write(
          kitPath(asset, 'svg'),
          serializeSvg(asset.colored),
        );
      }
      for (const asset of png ? context.select(png) : []) {
        const {width, height} = asset.colored;
        const scale = Math.min(
          options.png.scale,
          options.png.maxDimension / Math.max(width, height),
        );
        const image = await renderPng(
          asset.colored,
          tightFrame(asset.colored, Math.round(width * scale), Math.round(height * scale)),
        );
        context.assetManifest(asset).files.png = await context.write(kitPath(asset, 'png'), image);
      }
    },
  };
}
