import type {PipelineConfig} from "../../config.js";
import {boilContours} from "./boil.js";
import {flattenPath, serializeContours} from "./path-data.js";
import {simplifyContours} from "./simplify.js";
import {parseSvg, viewBoxString} from "./svg.js";
import type {Artwork, Contour} from "./types.js";

export const modificationNotice =
  "Modified by Elanor from Google Material Symbols: sampled, noise-displaced, and simplified. Apache-2.0; see LICENSE and NOTICE.";

export interface PipelineResult {
  svg: string;
  artwork: Artwork;
}

export function processSvg(source: string, config: PipelineConfig, fileName = "SVG"): PipelineResult {
  const artwork = parseSvg(source, fileName);
  const contours = transformContours(artwork, config);
  const result: Artwork = {
    viewBox: artwork.viewBox,
    // With every stage off, the untouched upstream path is already compact.
    d: contours ? serializeContours(contours, outputDecimals(artwork, config)) : artwork.d,
  };
  return {artwork: result, svg: serializeSvg(result, config.targetSize)};
}

/** Sampled, boiled, and simplified contours, or undefined when both stages are off. */
export function transformContours(artwork: Artwork, config: PipelineConfig): Contour[] | undefined {
  if (!config.boiling.enabled && !config.simplification.enabled) return undefined;
  if (!(config.targetSize > 0)) throw new Error("Target size must be positive");

  // Use the smaller source-units/display-pixel ratio so the configured error
  // and sampling limits also hold for non-square viewBoxes.
  const unitsPerDisplayPixel = unitsPerPixel(artwork, config);
  const sampled = flattenPath(artwork.d, config.boiling.samplingStep * unitsPerDisplayPixel);
  const boiled = boilContours(sampled, artwork.viewBox, config);
  return config.simplification.enabled
    ? simplifyContours(boiled, config.simplification.tolerance * unitsPerDisplayPixel)
    : boiled;
}

/** Fewest decimal places whose rounding step stays within the configured precision. */
export function outputDecimals(artwork: Artwork, config: PipelineConfig): number {
  const step = config.output.precision * unitsPerPixel(artwork, config);
  if (!(step > 0)) throw new Error("Output precision must be positive");
  return Math.max(0, Math.ceil(-Math.log10(step)));
}

export function unitsPerPixel(artwork: Artwork, config: PipelineConfig): number {
  return Math.min(artwork.viewBox.width, artwork.viewBox.height) / config.targetSize;
}

export function serializeSvg(artwork: Artwork, targetSize: number): string {
  return `<!-- ${modificationNotice} -->\n<svg xmlns="http://www.w3.org/2000/svg" width="${targetSize}" height="${targetSize}" viewBox="${viewBoxString(artwork.viewBox)}"><path d="${artwork.d}"/></svg>\n`;
}
