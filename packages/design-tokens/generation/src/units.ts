import type { GenerationConfig } from "./types";

/**
 * Converts a pixel measurement using the repository-wide rem baseline.
 *
 * @param pixelValue The measurement in pixels.
 * @param config Global generation settings.
 * @returns The equivalent measurement in rem.
 */
export function pixelsToRem(
  pixelValue: number,
  config: GenerationConfig,
): number {
  return pixelValue / config.pixelsPerRem;
}
