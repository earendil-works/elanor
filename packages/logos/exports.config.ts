import {type BrandId, gridUnit, type LogoKind, type Treatment} from "./config.js";

/**
 * Everything the logo build exports besides the plain SVGs. Each entry is
 * handled by the exporter named by its `type` (see scripts/lib/exporters).
 * Add an entry to add an export; add an exporter to add a new kind of output.
 *
 * Asset selectors pick from every brand, kind, and color treatment; omit a
 * field to select all of them.
 */

export type TreatmentId = Treatment["id"];

export interface AssetSelector {
  brands?: BrandId[];
  kinds?: LogoKind[];
  treatments?: TreatmentId[];
}

export type ExportDefinition =
  /** Logo files for the press kit folders. */
  | {type: "logo-files"; select?: AssetSelector; formats: Array<"svg" | "png">; png: {scale: number; maxDimension: number}}
  /** Fixed-height PNGs, e.g. for email signatures. */
  | {type: "png-heights"; name: string; select: AssetSelector; heights: number[]}
  /**
   * Vector CMYK PDFs for print, one per print profile stored on the color
   * tokens. Each profile maps to the characterization its PDFs declare as
   * output condition.
   */
  | {type: "print"; select: AssetSelector; profiles: Record<string, string>; millimetersPerUnit: number}
  /**
   * Favicon, touch icon, PWA icons, web manifest, and an HTML snippet.
   * `svgSize` is the SVG favicon's pixel size, `padding` the space in source
   * units around the touch and app icons, and `safeZone` the share of the
   * maskable icon whose central circle holds the artwork.
   */
  | {
      type: "favicons";
      svgSize: number;
      icoSizes: number[];
      appleTouchSize: number;
      iconSizes: number[];
      maskableSize: number;
      padding: number;
      safeZone: number;
    }
  /** Square profile pictures; the artwork fits a central circle of `safeZone` of the width, so circular crops never cut it. */
  | {type: "avatars"; sizes: number[]; treatments: TreatmentId[]; safeZone: number}
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
    // White prints no ink, so on dark backgrounds it knocks out to the paper.
    select: {treatments: ["on-light", "on-dark", "monochrome-on-light", "monochrome-on-dark"]},
    profiles: {psoCoatedV3: "FOGRA51", psoUncoatedV3: "FOGRA52"},
    // The 560-unit symbol frame prints 40 mm wide by default; the PDFs are vectors and scale freely.
    millimetersPerUnit: 40 / 560,
  },
  {
    type: "favicons",
    svgSize: 32,
    icoSizes: [16, 32, 48],
    appleTouchSize: 180,
    iconSizes: [192, 512],
    maskableSize: 512,
    padding: gridUnit,
    safeZone: 0.8,
  },
  {type: "avatars", sizes: [400, 800], treatments: ["on-light", "on-dark"], safeZone: 0.8},
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
