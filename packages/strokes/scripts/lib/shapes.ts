import type {StrokeStyle} from "../../config.js";
import {bend, roundedRectangle, straightLine, type Strip} from "./geometry.js";
import type {Polygon} from "./path.js";

/** Length of the stretchable middle of each edge in the canonical drawing, in pixels. */
const CANONICAL_EDGE = 64;
/**
 * Stretched middles extend this far under their neighbors, in pixels. Slice
 * boundaries often land on fractional device pixels, where two abutting layers
 * would each paint partial coverage and leave a hairline gap.
 */
export const OVERLAP = 0.5;

export type Region = [number, number, number, number];
export type Slices = Array<Region | null>;

export interface Shape {
  name: string;
  kind: "box" | "circle" | "line";
  /** Pixel size of the element the shape was drawn for (lines: length 0). */
  size: {width: number; height: number; radius: number};
  /** Draws the shape within a band of `band` pixels inside the element's edge. */
  draw(band: number, variant: number): {polygons: Polygon[]; slices: Slices; slice: number};
}

/** Eight border regions of a nine-slice (no center), as [left, top, right, bottom]. */
function nineSlice(width: number, height: number, slice: number): Slices {
  const regions: Region[] = [
    [0, 0, slice, slice],
    [slice - OVERLAP, 0, width - slice + OVERLAP, slice],
    [width - slice, 0, width, slice],
    [0, slice - OVERLAP, slice, height - slice + OVERLAP],
    [width - slice, slice - OVERLAP, width, height - slice + OVERLAP],
    [0, height - slice, slice, height],
    [slice - OVERLAP, height - slice, width - slice + OVERLAP, height],
    [width - slice, height - slice, width, height],
  ];
  // Pills have no straight sides; their side middles only span the overlap.
  return regions.map((region) => (region[2] - region[0] > 2 * OVERLAP + 1e-6 && region[3] - region[1] > 2 * OVERLAP + 1e-6 ? region : null));
}

export function shapesFor(style: StrokeStyle, strip: Strip, pixels: (path: string) => number): Shape[] {
  const options = (variant: number) => ({seed: style.seed, variant, pressure: style.pressure});
  // The stroke's half-width with its widest pressure is extent × width × (1 + Σ amplitude), so this brush
  // width fills a band exactly. The backbone runs through the band's middle.
  const brushWidth = (band: number) => band / (2 * strip.extent * (1 + style.pressure.reduce((sum, {amplitude}) => sum + amplitude, 0)));

  const rounded = (name: string, kind: "box" | "circle", width: number, height: number, radius: number): Shape => ({
    name,
    kind,
    size: {width, height, radius},
    draw(band, variant) {
      const half = band / 2;
      const backbone = roundedRectangle(half, half, width - band, height - band, Math.max(radius - half, 0));
      const polygons = bend(strip, backbone, brushWidth(band), options(variant));
      if (kind === "circle") return {polygons, slices: [[0, 0, width, height]], slice: 0};
      // Corners hold the curve and the full band; the rest of each edge is straight and stretches.
      const slice = Math.max(radius, band);
      return {polygons, slices: nineSlice(width, height, slice), slice};
    },
  });

  const shapes: Shape[] = [];
  for (const [name, token] of Object.entries(style.shapes.boxes)) {
    const radius = pixels(token);
    shapes.push(rounded(`box-${name}`, "box", 2 * radius + CANONICAL_EDGE, 2 * radius + CANONICAL_EDGE / 2, radius));
  }
  for (const [name, token] of Object.entries(style.shapes.pills)) {
    const height = pixels(token);
    shapes.push(rounded(`pill-${name}`, "box", height + CANONICAL_EDGE, height, height / 2));
  }
  for (const [name, token] of Object.entries(style.shapes.circles)) {
    const diameter = pixels(token);
    shapes.push(rounded(`circle-${name}`, "circle", diameter, diameter, diameter / 2));
  }
  const {taper} = style.shapes.lines;
  for (const vertical of [false, true]) {
    shapes.push({
      name: vertical ? "line-vertical" : "line",
      kind: "line",
      size: {width: 0, height: 0, radius: 0},
      draw(band, variant) {
        const length = 2 * taper + CANONICAL_EDGE;
        let polygons = bend(strip, straightLine(0, band / 2, length), brushWidth(band), {...options(variant), taper});
        const regions: Region[] = [
          [0, 0, taper, band],
          [taper - OVERLAP, 0, length - taper + OVERLAP, band],
          [length - taper, 0, length, band],
        ];
        if (!vertical) return {polygons, slices: regions, slice: taper};
        polygons = polygons.map((polygon) => polygon.map(([x, y]): [number, number] => [y, x]));
        return {polygons, slices: regions.map(([l, t, r, b]): Region => [t, l, b, r]), slice: taper};
      },
    });
  }
  return shapes;
}
