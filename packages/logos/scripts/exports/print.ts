import {logoTokens} from "../../config.js";
import {createPdf} from "../lib/pdf.js";
import type {AssetSelector, ExportPlugin} from "./plugin.js";

const PRINT_EXTENSION_KEY = "com.earendil-works.print";

export interface PrintOptions {
  select?: AssetSelector;
  /** Print profiles stored on the color tokens, each mapped to the characterization its PDFs declare as output condition. */
  profiles: Record<string, string>;
  millimetersPerUnit: number;
}

/** Vector CMYK PDFs for print, one per print profile. */
export function print(options: PrintOptions): ExportPlugin {
  return {
    name: "print",
    async run(context) {
      for (const asset of context.select(options.select)) {
        const tokens = await context.tokens(asset.brand);
        const pdfs: Record<string, string> = {};
        for (const [profile, outputCondition] of Object.entries(options.profiles)) {
          const paths = asset.source.paths.map(({d, token, fillRule}) => {
            const linked = asset.treatment.monochrome ? logoTokens.monochrome : token;
            const primitive = tokens.tokens[linked]?.aliasOf?.[asset.treatment.scheme];
            const print = primitive ? tokens.tokens[primitive]?.extensions?.[PRINT_EXTENSION_KEY] : undefined;
            const cmyk = (print as {cmyk?: Record<string, [number, number, number, number]>} | undefined)?.cmyk?.[profile];
            if (!cmyk) throw new Error(`${linked} (${asset.treatment.scheme}) has no ${profile} CMYK build`);
            return {d, cmyk, ...(fillRule ? {fillRule} : {})};
          });
          const pdf = createPdf(
            {width: asset.source.width, height: asset.source.height, paths},
            {millimetersPerUnit: options.millimetersPerUnit, title: asset.id, outputCondition},
          );
          pdfs[profile] = await context.write(`kits/${asset.brand}/print/${profile}/${asset.id}.pdf`, pdf);
        }
        context.assetManifest(asset).files.pdf = pdfs;
      }
    },
  };
}
