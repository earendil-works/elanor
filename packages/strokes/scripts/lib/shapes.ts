import type {StrokeStyle} from "../../config.js";
import {bend, clipHalfPlane, roundedRectangle, sample, section, segment, straightLine, type Strip} from "./geometry.js";
import type {Point, Polygon} from "./path.js";

/** Length of the stretchable middle of each edge in the canonical drawing, in pixels. */
const CANONICAL_EDGE = 64;
/**
 * Stretched middles extend this far under their neighbors, in pixels. Slice
 * boundaries often land on fractional device pixels, where two abutting layers
 * would each paint partial coverage and leave a hairline gap.
 */
export const OVERLAP = 0.5;
/** How far, in pixels, the segments of a mark overlap at a corner, so no seam shows between them. */
const MARK_SEAM = 0.25;

export type Region = [number, number, number, number];
export type Slices = Array<Region | null>;

export interface Shape {
  name: string;
  kind: "box" | "circle" | "line";
  /** Pixel size of the element the shape was drawn for (lines: length 0). */
  size: {width: number; height: number; radius: number};
  /** Draws the shape over a band of `band` pixels inside the element's edge; shapes reach past it by the style's overlap. */
  draw(band: number, variant: number): Drawing;
}

export interface Drawing {
  /** The stroke, filled even-odd so the brush's texture stays open. */
  polygons: Polygon[];
  /** A solid ring around the edge of the element's background, under the stroke; empty for lines. */
  core: Polygon[];
  slices: Slices;
  slice: number;
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

/** How a style lays its brush along a path; shared by outline shapes and marks. */
function brushwork(style: StrokeStyle, strip: Strip) {
  const options = (variant: number) => ({seed: style.seed, variant, pressure: style.pressure});
  const swing = style.pressure.reduce((sum, {amplitude}) => sum + amplitude, 0);
  const [widest, narrowest] = [1 + swing, 1 - swing];
  // A line's half-width with its widest pressure is extent × width × widest, so this brush width fills
  // a band exactly. The backbone runs through the band's middle.
  const lineWidth = (band: number) => band / (2 * strip.extent * widest);

  // A rounded shape's rough edge reaches the element's edge at its farthest, and its smooth edge reaches
  // past the band by the overlap at its nearest, so the stroke always covers the edge of the background.
  const {inner, outer} = strip.edges;
  const shapeWidth = (band: number) => (band + style.overlap) / (outer[1] * widest + inner[0] * narrowest);

  /** A rounded rectangle's stroke, and the outline of the same shape inset by `inset`, for its core. */
  const rounded = (width: number, height: number, radius: number, band: number, variant: number) => {
    const brush = shapeWidth(band);
    const depth = outer[1] * brush * widest;
    const inset = (by: number) => roundedRectangle(by, by, width - 2 * by, height - 2 * by, Math.max(radius - by, 0));
    return {
      polygons: bend(strip, inset(depth), brush, options(variant)),
      ring: (by: number) => sample(inset(by), 0.25),
      /** How deep the stroke reaches at most. */
      reach: depth + strip.extent * brush * widest,
    };
  };
  return {options, lineWidth, rounded};
}

export function shapesFor(style: StrokeStyle, strip: Strip, pixels: (path: string) => number): Shape[] {
  const {options, lineWidth, rounded: stroke} = brushwork(style, strip);

  const rounded = (name: string, kind: "box" | "circle", width: number, height: number, radius: number): Shape => ({
    name,
    kind,
    size: {width, height, radius},
    draw(band, variant) {
      const {polygons, ring, reach} = stroke(width, height, radius, band, variant);
      // The brush's texture can crack in from its rough edge; the core keeps the background's edge
      // covered by the overlap on both sides, so the page never shows against it.
      const core = [ring(band - style.overlap), ring(band + style.overlap)];
      if (kind === "circle") return {polygons, core, slices: [[0, 0, width, height]], slice: 0};
      // Corners hold the curve and the stroke's full reach, in whole pixels so slice boundaries land on
      // pixel edges; the rest of each edge is straight and stretches.
      const slice = Math.max(radius, Math.ceil(reach));
      return {polygons, core, slices: nineSlice(width, height, slice), slice};
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
        let polygons = bend(strip, straightLine(0, band / 2, length), lineWidth(band), {...options(variant), ends: {start: {shape: "point", length: taper}, end: {shape: "point", length: taper}}});
        const regions: Region[] = [
          [0, 0, taper, band],
          [taper - OVERLAP, 0, length - taper + OVERLAP, band],
          [length - taper, 0, length, band],
        ];
        if (!vertical) return {polygons, core: [], slices: regions, slice: taper};
        polygons = polygons.map((polygon) => polygon.map(([x, y]): [number, number] => [y, x]));
        return {polygons, core: [], slices: regions.map(([l, t, r, b]): Region => [t, l, b, r]), slice: taper};
      },
    });
  }
  return shapes;
}

export interface Mark {
  name: "check" | "dash" | "dot";
  /** The mark in a square of `size` pixels, as layers that each fill even-odd and add up. */
  layers: Polygon[][];
  size: number;
}

/** Marks inside controls: a check and a dash drawn as strokes, and a dot filled like a drawn circle. */
export function marksFor(style: StrokeStyle, strip: Strip, pixels: (path: string) => number): Mark[] {
  const {options, lineWidth, rounded} = brushwork(style, strip);
  const size = pixels(style.marks.size);
  const thickness = pixels(style.marks.thickness);
  const width = lineWidth(thickness);
  const {ends} = style.marks;
  // A path is one stroke: each segment is drawn with its own section of the brush, so the texture runs
  // on across corners, and reaches past each corner to its miter point. Neighbors are cut on the
  // corner's bisector, overlapping a little so no seam shows, and add up as separate layers.
  const path = (fractions: Array<[number, number]>) => {
    const points = fractions.map(([x, y]): Point => [x * size, y * size]);
    const directions = points.slice(1).map((to, index) => {
      const from = points[index]!;
      const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
      return {length, x: (to[0] - from[0]) / length, y: (to[1] - from[1]) / length};
    });
    const total = directions.reduce((sum, {length}) => sum + length, 0);
    const half = width * strip.extent;
    /** At corner k: how far a segment reaches past it, and the bisector's normal, pointing along the path. */
    const corner = (k: number) => {
      const [a, b] = [directions[k - 1]!, directions[k]!];
      const turn = Math.acos(Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y)));
      const normal = Math.hypot(a.x + b.x, a.y + b.y);
      return {reach: half * Math.tan(turn / 2) + MARK_SEAM, normal: [(a.x + b.x) / normal, (a.y + b.y) / normal] as Point};
    };
    let start = 0;
    return directions.map((direction, index) => {
      const [first, last] = [index === 0, index === directions.length - 1];
      const before = first ? 0 : corner(index).reach;
      const after = last ? 0 : corner(index + 1).reach;
      const from = points[index]!;
      const along = (distance: number): Point => [from[0] + direction.x * distance, from[1] + direction.y * distance];
      const backbone = segment(along(-before), along(direction.length + after));
      const brush = section(strip, (start - before) / total, (start + direction.length + after) / total);
      start += direction.length;
      let polygons = bend(brush, backbone, width, {seed: style.seed, variant: 0, pressure: [], ends: {start: first ? ends.start : undefined, end: last ? ends.end : undefined}});
      if (!first) {
        const {normal} = corner(index);
        polygons = polygons.map((polygon) => clipHalfPlane(polygon, from, [-normal[0], -normal[1]], MARK_SEAM / 2));
      }
      if (!last) polygons = polygons.map((polygon) => clipHalfPlane(polygon, points[index + 1]!, corner(index + 1).normal, MARK_SEAM / 2));
      return polygons.filter((polygon) => polygon.length > 2);
    });
  };
  const dot = rounded(size, size, size / 2, thickness, 0);
  return [
    {name: "check", layers: path(style.marks.check), size},
    {name: "dash", layers: path(style.marks.dash), size},
    // The core fills the dot inside its stroke.
    {name: "dot", layers: [dot.polygons, [dot.ring(thickness - style.overlap)]], size},
  ];
}
