import type {Brush, Point, Polygon} from "./path.js";

/**
 * A normalized brush strip: `u` runs from 0 to 1 along the stroke, `v` is the
 * signed offset from its centerline in stroke widths (the edges sit near ±0.5).
 */
export interface Strip {
  polygons: Polygon[];
  /** Largest |v| of any point, used to fit the stroke into its band. */
  extent: number;
}

export function signedArea(polygon: Polygon): number {
  let area = 0;
  for (let i = 0; i < polygon.length; i += 1) {
    const [ax, ay] = polygon[i]!;
    const [bx, by] = polygon[(i + 1) % polygon.length]!;
    area += ax * by - bx * ay;
  }
  return area / 2;
}

/** Top and bottom of a polygon's silhouette at x. */
export function envelope(polygon: Polygon, x: number): [number, number] {
  const ys: number[] = [];
  for (let i = 0; i < polygon.length; i += 1) {
    const a = polygon[i]!;
    const b = polygon[(i + 1) % polygon.length]!;
    if (a[0] !== b[0] && x >= Math.min(a[0], b[0]) && x < Math.max(a[0], b[0])) {
      ys.push(a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0]));
    }
  }
  if (ys.length < 2) throw new Error(`The brush silhouette has no width at x=${x}`);
  return [Math.min(...ys), Math.max(...ys)];
}

const smoothstep = (x: number) => x * x * (3 - 2 * x);

/**
 * Turns a brush into a strip without taper: crops [start, end], divides out the
 * smoothed width envelope so the stroke keeps one width, and blends the outer
 * silhouette into exactly matching ends so the strip can close into a loop.
 * Irregularities finer than `smoothing` survive.
 */
export function normalizeBrush(brush: Brush, {start, end, smoothing}: {start: number; end: number; smoothing: number}): Strip {
  const outer = brush.polygons.reduce((a, b) => (Math.abs(signedArea(a)) >= Math.abs(signedArea(b)) ? a : b));
  const samples = 800;
  const envelopes = Array.from({length: samples + 1}, (_, i) => {
    const x = start + ((end - start) * i) / samples;
    const window = Array.from({length: 21}, (_, j) => envelope(outer, x + ((j - 10) / 20) * smoothing));
    return [0, 1].map((axis) => window.reduce((sum, value) => sum + value[axis]!, 0) / window.length) as [number, number];
  });
  const envelopeAt = (x: number): [number, number] => {
    const t = Math.min(samples, Math.max(0, ((x - start) / (end - start)) * samples));
    const a = envelopes[Math.floor(t)]!;
    const b = envelopes[Math.ceil(t)]!;
    const mix = t % 1;
    return [a[0] * (1 - mix) + b[0] * mix, a[1] * (1 - mix) + b[1] * mix];
  };
  const collar = Math.min(2, (end - start) / 10);

  const polygons = brush.polygons
    .map((polygon) => ({polygon, clipped: clipPolygon(polygon, [start, -Infinity, end, Infinity])}))
    .filter(({clipped}) => clipped.length > 2)
    .map(({polygon, clipped}) => {
      const isOuter = polygon === outer;
      if (!isOuter && clipped.some(([x]) => x <= start + 1e-9 || x >= end - 1e-9)) {
        throw new Error(`The brush has a hole at its cut; move normalize.start/end (${start}, ${end}) into solid parts`);
      }
      return clipped.map(([x, y]): Point => {
        const [low, high] = envelopeAt(x);
        let v = (y - (low + high) / 2) / (high - low);
        if (isOuter) {
          // Near the cuts the edge blends to exactly ±0.5, so both ends match.
          const blend = smoothstep(Math.min(1, Math.min(x - start, end - x) / collar));
          v = Math.sign(v) * 0.5 * (1 - blend) + v * blend;
        }
        return [(x - start) / (end - start), v];
      });
    });
  const extent = Math.max(...polygons.flat().map(([, v]) => Math.abs(v)));
  return {polygons, extent};
}

/** A path parameterized by arc length: position and unit tangent at distance s. */
export interface Backbone {
  length: number;
  at(s: number): [x: number, y: number, tx: number, ty: number];
  closed: boolean;
}

/** A clockwise rounded rectangle starting at the top-left end of the top edge. */
export function roundedRectangle(x: number, y: number, width: number, height: number, radius: number): Backbone {
  const r = Math.min(radius, width / 2, height / 2);
  const horizontal = width - 2 * r;
  const vertical = height - 2 * r;
  const arc = (Math.PI * r) / 2;
  const corner = (cx: number, cy: number, from: number) => (t: number): [number, number, number, number] => {
    const angle = from + (r > 0 ? t / r : 0);
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle), -Math.sin(angle), Math.cos(angle)];
  };
  const segments: Array<[number, (t: number) => [number, number, number, number]]> = [
    [horizontal, (t) => [x + r + t, y, 1, 0]],
    [arc, corner(x + width - r, y + r, -Math.PI / 2)],
    [vertical, (t) => [x + width, y + r + t, 0, 1]],
    [arc, corner(x + width - r, y + height - r, 0)],
    [horizontal, (t) => [x + width - r - t, y + height, -1, 0]],
    [arc, corner(x + r, y + height - r, Math.PI / 2)],
    [vertical, (t) => [x, y + height - r - t, 0, -1]],
    [arc, corner(x + r, y + r, Math.PI)],
  ];
  const length = segments.reduce((sum, [size]) => sum + size, 0);
  return {
    length,
    closed: true,
    at(s) {
      let rest = ((s % length) + length) % length;
      for (const [size, at] of segments) {
        if (size > 0 && rest <= size) return at(rest);
        rest -= size;
      }
      return segments[0]![1](0);
    },
  };
}

export function straightLine(x: number, y: number, length: number): Backbone {
  return {length, closed: false, at: (s) => [x + s, y, 1, 0]};
}

/** Deterministic differences between variants of the same shape. */
export interface Variation {
  /** Where along the loop the strip starts, as a fraction of its length. */
  phase: number;
  reverse: boolean;
  /** Mirrors the stroke across its centerline. */
  flip: boolean;
}

export function variation(seed: number, variant: number): Variation {
  return {
    phase: (seed * 0.61803398875 + variant * 0.17320508076) % 1,
    reverse: variant % 2 === 1,
    flip: variant % 3 === 0,
  };
}

/**
 * Bends the strip along a backbone with a fixed stroke width. On closed
 * backbones the strip wraps once around, and pressure changes complete whole
 * cycles, so the loop has no visible start. `taper` narrows open strokes to a
 * point over that many pixels at each end.
 */
export function bend(
  strip: Strip,
  backbone: Backbone,
  width: number,
  options: {seed: number; variant: number; pressure: Array<{cycles: number; amplitude: number}>; taper?: number},
): Polygon[] {
  const {phase, reverse, flip} = variation(options.seed, options.variant);
  const pressure = (s: number) =>
    1 +
    options.pressure.reduce(
      (sum, {cycles, amplitude}, index) =>
        sum + amplitude * Math.sin(((2 * Math.PI * cycles * s) / backbone.length) + options.variant * 1.7 + index),
      0,
    );
  return strip.polygons.map((polygon) =>
    polygon.map(([u, v]): Point => {
      const along = reverse ? 1 - u : u;
      const s = backbone.closed ? (along + phase) * backbone.length : along * backbone.length;
      const [x, y, tx, ty] = backbone.at(s);
      let taper = 1;
      if (options.taper && !backbone.closed) {
        taper = smoothstep(Math.min(1, Math.min(s, backbone.length - s) / options.taper));
      }
      // The normal (-ty, tx) points inward on a clockwise loop.
      const offset = v * width * pressure(s) * taper * (flip ? -1 : 1);
      return [x - ty * offset, y + tx * offset];
    }),
  );
}

/** Sutherland–Hodgman clipping against an axis-aligned rectangle [left, top, right, bottom]. */
export function clipPolygon(polygon: Polygon, [left, top, right, bottom]: [number, number, number, number]): Polygon {
  let points = polygon;
  for (const [axis, boundary, sign] of [
    [0, left, 1],
    [0, right, -1],
    [1, top, 1],
    [1, bottom, -1],
  ] as const) {
    if (!Number.isFinite(boundary)) continue;
    const output: Polygon = [];
    for (let i = 0; i < points.length; i += 1) {
      const a = points[i]!;
      const b = points[(i + 1) % points.length]!;
      const insideA = sign * (a[axis] - boundary) >= -1e-9;
      const insideB = sign * (b[axis] - boundary) >= -1e-9;
      if (insideA) output.push(a);
      if (insideA !== insideB) {
        const t = (boundary - a[axis]) / (b[axis] - a[axis]);
        const point: Point = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
        point[axis] = boundary;
        output.push(point);
      }
    }
    points = output;
  }
  return points;
}

const format = (value: number) => {
  const rounded = Math.round(value * 1000) / 1000;
  return Object.is(rounded, -0) ? "0" : String(rounded);
};

/** Douglas–Peucker simplification of an open polyline. */
function simplify(points: Point[], tolerance: number): Point[] {
  if (points.length < 3) return points;
  const a = points[0]!;
  const b = points.at(-1)!;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const lengthSquared = dx * dx + dy * dy;
  let maximum = tolerance * tolerance;
  let split = -1;
  for (let i = 1; i < points.length - 1; i += 1) {
    const p = points[i]!;
    const t = lengthSquared ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / lengthSquared)) : 0;
    const distance = (p[0] - a[0] - t * dx) ** 2 + (p[1] - a[1] - t * dy) ** 2;
    if (distance > maximum) {
      maximum = distance;
      split = i;
    }
  }
  if (split < 0) return [a, b];
  return [...simplify(points.slice(0, split + 1), tolerance).slice(0, -1), ...simplify(points.slice(split), tolerance)];
}

export function pathData(polygons: Polygon[], [x, y]: [number, number], tolerance: number): string {
  return polygons
    .filter((polygon) => polygon.length > 2)
    .map((polygon) => {
      const middle = Math.floor(polygon.length / 2);
      const reduced = [
        ...simplify(polygon.slice(0, middle + 1), tolerance).slice(0, -1),
        ...simplify([...polygon.slice(middle), polygon[0]!], tolerance).slice(0, -1),
      ];
      return `M${reduced.map(([px, py]) => `${format(px - x)} ${format(py - y)}`).join("L")}Z`;
    })
    .join("");
}

/**
 * A mask image for one region of a shape. `preserveAspectRatio="none"` lets CSS
 * stretch a region along one axis without changing the stroke width.
 */
export function maskSvg(polygons: Polygon[], [left, top, right, bottom]: [number, number, number, number], tolerance = 0.01): string {
  const clipped = polygons.map((polygon) => clipPolygon(polygon, [left, top, right, bottom]));
  const width = right - left;
  const height = bottom - top;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${format(width)} ${format(height)}" preserveAspectRatio="none"><path fill-rule="evenodd" d="${pathData(clipped, [left, top], tolerance)}"/></svg>\n`;
}
