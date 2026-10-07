import sharp from "sharp";
import {type ColoredArtwork, pathElements} from "./compose.js";

export interface Frame {
  /** Region of artwork coordinates shown, as x, y, width, height. */
  viewBox: [number, number, number, number];
  width: number;
  height: number;
  background?: string;
  /** CSS for the SVG, such as color-scheme rules for classed paths. */
  style?: string;
}

/** The artwork's own bounds. */
export function tightFrame(artwork: ColoredArtwork, width: number, height: number): Frame {
  return {viewBox: [0, 0, artwork.width, artwork.height], width, height};
}

/** A square frame with the artwork centered and `padding` source units around its longer side. */
export function squareFrame(artwork: ColoredArtwork, size: number, padding: number, background?: string): Frame {
  const side = Math.max(artwork.width, artwork.height) + 2 * padding;
  return centeredSquare(artwork, side, size, background);
}

/**
 * A square frame in which the artwork's bounding box fits inside a centered
 * circle with `ratio` of the frame's width as diameter, so circular crops and
 * maskable-icon masks never cut into it.
 */
export function circleSafeFrame(artwork: ColoredArtwork, size: number, ratio: number, background?: string): Frame {
  const side = Math.hypot(artwork.width, artwork.height) / ratio;
  return centeredSquare(artwork, side, size, background);
}

function centeredSquare(artwork: ColoredArtwork, side: number, size: number, background?: string): Frame {
  return {
    viewBox: [(artwork.width - side) / 2, (artwork.height - side) / 2, side, side],
    width: size,
    height: size,
    ...(background ? {background} : {}),
  };
}

export function frameSvg(artwork: ColoredArtwork, frame: Frame): string {
  const [x, y, width, height] = frame.viewBox;
  const background = frame.background
    ? `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${frame.background}"/>`
    : "";
  const style = frame.style ? `<style>${frame.style}</style>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${frame.width}" height="${frame.height}" viewBox="${x} ${y} ${width} ${height}">${style}${background}${pathElements(artwork.paths)}</svg>`;
}

export async function renderPng(artwork: ColoredArtwork, frame: Frame): Promise<Buffer> {
  return svgToPng(frameSvg(artwork, frame));
}

/** Rasterizes an SVG document at its own width and height. */
export async function svgToPng(svg: string): Promise<Buffer> {
  return sharp(Buffer.from(svg)).png({compressionLevel: 9}).toBuffer();
}
