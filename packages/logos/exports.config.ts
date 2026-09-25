import type {BrandId} from "./config.js";

/**
 * Everything the logo build exports besides the plain SVGs. Each entry is
 * handled by the exporter named by its `type` (see scripts/lib/exporters).
 * Add an entry to add an export; add an exporter to add a new kind of output.
 *
 * Asset selectors pick from every brand, kind, and color treatment; omit a
 * field to select all of them.
 */

export type Kind = "logo" | "logo-wordmark-horizontal" | "logo-wordmark-stacked";
export type TreatmentId = "on-light" | "on-dark" | "monochrome-on-light" | "monochrome-on-dark";

export interface AssetSelector {
  brands?: BrandId[];
  kinds?: Kind[];
  treatments?: TreatmentId[];
}

export type ExportDefinition =
  /** Logo files for the press kit folders. */
  | {type: "logo-files"; select?: AssetSelector; formats: Array<"svg" | "png">; png: {scale: number; maxDimension: number}}
  /** Fixed-height PNGs, e.g. for email signatures. */
  | {type: "png-heights"; name: string; select: AssetSelector; heights: number[]}
  /** Vector CMYK PDFs for print, one per print profile stored on the color tokens. */
  | {type: "print"; select: AssetSelector; profiles: string[]; millimetersPerUnit: number}
  /** Favicon, touch icon, PWA icons, web manifest, and an HTML snippet. */
  | {type: "favicons"; icoSizes: number[]; appleTouchSize: number; iconSizes: number[]; maskableSize: number}
  /** Square profile pictures that survive circular cropping. */
  | {type: "avatars"; sizes: number[]; treatments: TreatmentId[]}
  /** Zip archives of the brand folders, plus the brand guidelines. */
  | {type: "press-kits"; kits: Record<string, BrandId[]>};

export const exportDefinitions: ExportDefinition[] = [
  {type: "logo-files", formats: ["svg", "png"], png: {scale: 2, maxDimension: 4096}},
  {
    type: "png-heights",
    name: "email-signature",
    select: {kinds: ["logo-wordmark-horizontal"], treatments: ["on-light"]},
    heights: [32, 64],
  },
  {
    type: "print",
    // A monochrome logo on dark backgrounds is unprinted paper or white ink, so it has no CMYK file.
    select: {treatments: ["on-light", "on-dark", "monochrome-on-light"]},
    profiles: ["psoCoatedV3", "psoUncoatedV3"],
    // The 560-unit symbol frame prints 40 mm wide by default; the PDFs are vectors and scale freely.
    millimetersPerUnit: 40 / 560,
  },
  {type: "favicons", icoSizes: [16, 32, 48], appleTouchSize: 180, iconSizes: [192, 512], maskableSize: 512},
  {type: "avatars", sizes: [400, 800], treatments: ["on-light", "on-dark"]},
  {
    type: "press-kits",
    kits: {
      earendil: ["earendil", "pi", "radius", "lefos"],
      pi: ["pi"],
      radius: ["radius"],
      lefos: ["lefos"],
    },
  },
];
