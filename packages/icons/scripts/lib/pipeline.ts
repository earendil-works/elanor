import type {PipelineConfig} from '../../config.js';
import {boilContours} from './boil.js';
import {flattenPath, serializeContours} from './path-data.js';
import {simplifyContours} from './simplify.js';
import {parseSvg, viewBoxString} from './svg.js';
import type {Artwork, Contour} from './types.js';

export interface PipelineResult {
  svg: string;
  artwork: Artwork;
}

export function processSvg(
  source: string,
  config: PipelineConfig,
  fileName = 'SVG',
): PipelineResult {
  const artwork = parseSvg(source, fileName);
  const contours = transformContours(artwork, config);
  const result: Artwork = {
    ...artwork,
    // With every stage off, the untouched upstream path is already compact.
    d: contours ? serializeContours(contours, outputDecimals(artwork, config)) : artwork.d,
  };
  return {artwork: result, svg: serializeSvg(result, config)};
}

/** The license notice for the stages that are enabled. */
export function modificationNotice(config: PipelineConfig): string {
  const sampled = config.boiling.enabled || config.simplification.enabled;
  const stages = [
    sampled && 'sampled',
    config.boiling.enabled && 'noise-displaced',
    config.simplification.enabled && 'simplified',
  ].filter((stage) => typeof stage === 'string');
  return stages.length > 0
    ? `Modified by Elanor from Google Material Symbols: ${listFormat.format(stages)}. Apache-2.0; see LICENSE and NOTICE.`
    : 'Google Material Symbols, renamed and repackaged by Elanor. Apache-2.0; see LICENSE and NOTICE.';
}

const listFormat = new Intl.ListFormat('en', {type: 'conjunction'});

/** Sampled, boiled, and simplified contours, or undefined when both stages are off. */
export function transformContours(artwork: Artwork, config: PipelineConfig): Contour[] | undefined {
  if (!config.boiling.enabled && !config.simplification.enabled) return undefined;

  // Use the smaller source-units/display-pixel ratio so the configured error
  // and sampling limits also hold for non-square viewBoxes.
  const unitsPerDisplayPixel = unitsPerPixel(artwork);
  const sampled = flattenPath(artwork.d, config.boiling.samplingStep * unitsPerDisplayPixel);
  const boiled = boilContours(sampled, artwork, config);
  return config.simplification.enabled
    ? simplifyContours(boiled, config.simplification.tolerance * unitsPerDisplayPixel)
    : boiled;
}

/** Fewest decimal places whose rounding step stays within the configured precision. */
export function outputDecimals(artwork: Artwork, config: PipelineConfig): number {
  const step = config.output.precision * unitsPerPixel(artwork);
  if (!(step > 0)) throw new Error('Output precision must be positive');
  return Math.max(0, Math.ceil(-Math.log10(step)));
}

export function unitsPerPixel(artwork: Artwork): number {
  return Math.min(artwork.viewBox.width, artwork.viewBox.height) / artwork.size;
}

export function serializeSvg(artwork: Artwork, config: PipelineConfig): string {
  const {size} = artwork;
  return `<!-- ${modificationNotice(config)} -->\n<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBoxString(artwork.viewBox)}"><path d="${artwork.d}"/></svg>\n`;
}
