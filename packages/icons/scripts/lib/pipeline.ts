import {optimize} from "svgo";
import type {PipelineConfig} from "../../config.js";
import {boilContours} from "./boil.js";
import {contoursToPathData, flattenPath} from "./paths.js";
import {simplifyContours} from "./simplify.js";
import {parseSvg, viewBoxString} from "./svg.js";
import type {Artwork} from "./types.js";

export const modificationNotice =
  "Modified by Elanor: sampled, noise-displaced, simplified, and optimized from Google Material Symbols. Apache-2.0; see LICENSE and NOTICE.";

export interface PipelineResult {
  beforeOptimization: string;
  svg: string;
  artwork: Artwork;
}

export function processSvg(
  source: string,
  config: PipelineConfig,
  fileName = "SVG",
): PipelineResult {
  const parsed = parseSvg(source, fileName);
  const artwork = transformArtwork(parsed, config);
  const beforeOptimization = serializeSvg(artwork, config.targetSize);
  const svg = config.optimization.enabled
    ? optimize(beforeOptimization, {
        multipass: false,
        plugins: [
          {
            name: "convertPathData",
            params: {floatPrecision: config.optimization.floatPrecision},
          },
        ],
      }).data
    : beforeOptimization;
  const finalArtwork = parseSvg(svg, `${fileName} after optimization`);
  return {beforeOptimization, svg: `${svg.trim()}\n`, artwork: finalArtwork};
}

function transformArtwork(artwork: Artwork, config: PipelineConfig): Artwork {
  if (!config.boiling.enabled && !config.simplification.enabled) return artwork;
  if (!(config.targetSize > 0)) throw new Error("Target size must be positive");

  // Use the smaller source-units/display-pixel ratio so the configured error
  // and sampling limits also hold for non-square viewBoxes.
  const unitsPerDisplayPixel =
    Math.min(artwork.viewBox.width, artwork.viewBox.height) / config.targetSize;
  const samplingStep = config.boiling.samplingStep * unitsPerDisplayPixel;
  const tolerance = config.simplification.tolerance * unitsPerDisplayPixel;

  return {
    ...artwork,
    paths: artwork.paths.map((path) => {
      const sampled = flattenPath(path.d, samplingStep);
      const boiled = boilContours(sampled, artwork.viewBox, config);
      const simplified = config.simplification.enabled
        ? simplifyContours(boiled, tolerance)
        : boiled;
      return {...path, d: contoursToPathData(simplified)};
    }),
  };
}

export function serializeSvg(artwork: Artwork, targetSize: number): string {
  const paths = artwork.paths
    .map(
      ({d, fillRule}) =>
        `  <path fill="#000000" fill-rule="${fillRule}" d="${escapeAttribute(d)}"/>`,
    )
    .join("\n");
  return `<!-- ${modificationNotice} -->\n<svg xmlns="http://www.w3.org/2000/svg" width="${targetSize}" height="${targetSize}" viewBox="${viewBoxString(artwork.viewBox)}">\n${paths}\n</svg>\n`;
}

function escapeAttribute(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}
