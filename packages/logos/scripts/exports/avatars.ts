import {type BrandId, brands} from "../../config.js";
import {circleSafeFrame, renderPng} from "../lib/raster.js";
import type {ExportPlugin, TreatmentId} from "./plugin.js";

export interface AvatarsOptions {
  sizes: number[];
  treatments: TreatmentId[];
  /** The artwork fits a central circle of this share of the width, so circular crops never cut it. */
  safeZone: number;
}

/** Square profile pictures on the brand's background. */
export function avatars(options: AvatarsOptions): ExportPlugin {
  return {
    name: "avatars",
    kitContents: "`social/` profile pictures",
    async run(context) {
      for (const brand of Object.keys(brands) as BrandId[]) {
        const entries = [];
        for (const treatment of options.treatments) {
          const mark = context.mark(brand, treatment);
          const background = await context.background(brand, mark.treatment.scheme);
          for (const size of options.sizes) {
            const png = await renderPng(mark.colored, circleSafeFrame(mark.colored, size, options.safeZone, background));
            entries.push({treatment, size, path: await context.write(`kits/${brand}/social/${brand}-avatar-${treatment}-${size}.png`, png)});
          }
        }
        context.brandManifest(brand).avatars = entries;
      }
    },
  };
}
