import type {Contour, Point} from "./types.js";

/**
 * Minimal SVG path support for Material Symbols sources: M, L, H, V, Q, T and Z
 * in absolute and relative form. Other commands throw.
 */

type Segment =
  | {type: "line"; from: Point; to: Point}
  | {type: "quadratic"; from: Point; control: Point; to: Point};

interface SubPath {
  segments: Segment[];
  closed: boolean;
}

const tokenPattern = /[A-Za-z]|[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/g;
const parameterCounts: Readonly<Record<string, number>> = {M: 2, L: 2, H: 1, V: 1, Q: 4, T: 2, Z: 0};

export function parsePathData(d: string): SubPath[] {
  if (d.replace(tokenPattern, "").replace(/[\s,]/g, "") !== "") {
    throw new Error("Path data contains unexpected characters");
  }
  const tokens = d.match(tokenPattern) ?? [];
  const subPaths: SubPath[] = [];
  let subPath: SubPath | undefined;
  let current: Point = {x: 0, y: 0};
  let start = current;
  let command = "";
  let lastControl: Point | undefined;
  let index = 0;

  const add = (segment: Segment): void => {
    if (!subPath || subPath.closed) {
      subPath = {segments: [], closed: false};
      subPaths.push(subPath);
      start = current;
    }
    subPath.segments.push(segment);
    current = segment.to;
  };

  while (index < tokens.length) {
    const token = tokens[index]!;
    if (/[A-Za-z]/.test(token)) {
      if (parameterCounts[token.toUpperCase()] === undefined) {
        throw new Error(`Unsupported path command ${token}`);
      }
      command = token;
      index += 1;
      if (command.toUpperCase() === "Z") {
        if (subPath) subPath.closed = true;
        current = start;
        lastControl = undefined;
        continue;
      }
    } else if (command === "" || command.toUpperCase() === "Z") {
      throw new Error("Path data has a number without a command");
    }

    const type = command.toUpperCase();
    const count = parameterCounts[type]!;
    const values = tokens.slice(index, index + count).map(Number);
    if (values.length !== count || values.some((value) => !Number.isFinite(value))) {
      throw new Error(`Path command ${command} has missing parameters`);
    }
    index += count;

    const relative = command !== type;
    const point = (x: number, y: number): Point =>
      relative ? {x: current.x + x, y: current.y + y} : {x, y};
    const [a = 0, b = 0, c = 0, e = 0] = values;
    let control: Point | undefined;

    switch (type) {
      case "M":
        current = point(a, b);
        start = current;
        subPath = {segments: [], closed: false};
        subPaths.push(subPath);
        // Further coordinate pairs after a move are implicit line commands.
        command = relative ? "l" : "L";
        break;
      case "L":
        add({type: "line", from: current, to: point(a, b)});
        break;
      case "H":
        add({type: "line", from: current, to: {x: relative ? current.x + a : a, y: current.y}});
        break;
      case "V":
        add({type: "line", from: current, to: {x: current.x, y: relative ? current.y + a : a}});
        break;
      case "Q":
        control = point(a, b);
        add({type: "quadratic", from: current, control, to: point(c, e)});
        break;
      case "T":
        control = lastControl
          ? {x: 2 * current.x - lastControl.x, y: 2 * current.y - lastControl.y}
          : current;
        add({type: "quadratic", from: current, control, to: point(a, b)});
        break;
    }
    lastControl = control;
  }

  return subPaths.filter(({segments}) => segments.length > 0);
}

/** Samples every segment at roughly `step` intervals along its length. */
export function flattenPath(d: string, step: number): Contour[] {
  if (!(step > 0)) throw new Error("Sampling step must be positive");

  return parsePathData(d).map(({segments, closed}) => {
    const first = segments[0]!.from;
    const last = segments.at(-1)!.to;
    const all: Segment[] =
      closed && !samePoint(first, last) ? [...segments, {type: "line", from: last, to: first}] : segments;

    const points: Point[] = [first];
    for (const segment of all) {
      const sampler = segmentSampler(segment);
      const count = Math.max(1, Math.ceil(sampler.length / step));
      for (let index = 1; index <= count; index += 1) {
        points.push(sampler.at((index / count) * sampler.length));
      }
    }
    if (closed && samePoint(points[0]!, points.at(-1)!)) points.pop();
    return {closed, points: points.filter((point, index) => index === 0 || !samePoint(point, points[index - 1]!))};
  });
}

function segmentSampler(segment: Segment): {length: number; at(distance: number): Point} {
  if (segment.type === "line") {
    const {from, to} = segment;
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    return {
      length,
      at: (distance) => {
        const t = length === 0 ? 1 : distance / length;
        return {x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t};
      },
    };
  }

  // Arc length of a quadratic curve via a fine polyline lookup table.
  const {from, control, to} = segment;
  const curve = (t: number): Point => {
    const u = 1 - t;
    return {
      x: u * u * from.x + 2 * u * t * control.x + t * t * to.x,
      y: u * u * from.y + 2 * u * t * control.y + t * t * to.y,
    };
  };
  const divisions = 64;
  const lengths = [0];
  let previous = from;
  for (let index = 1; index <= divisions; index += 1) {
    const point = curve(index / divisions);
    lengths.push(lengths[index - 1]! + Math.hypot(point.x - previous.x, point.y - previous.y));
    previous = point;
  }
  const length = lengths[divisions]!;
  return {
    length,
    at: (distance) => {
      if (distance >= length) return to;
      let index = 1;
      while (lengths[index]! < distance) index += 1;
      const before = lengths[index - 1]!;
      const span = lengths[index]! - before;
      return curve((index - 1 + (span === 0 ? 0 : (distance - before) / span)) / divisions);
    },
  };
}

/**
 * Writes polylines as compact relative path data. Coordinates are rounded to
 * `decimals` once, as absolute fixed-point integers, so relative steps never
 * accumulate rounding error.
 */
export function serializeContours(contours: Contour[], decimals: number): string {
  if (!Number.isInteger(decimals) || decimals < 0) throw new Error("Decimals must be a non-negative integer");
  const scale = 10 ** decimals;
  let output = "";
  let previousCommand = "";
  let previousNumber: string | undefined;
  let current = {x: 0, y: 0};

  const write = (command: string, values: number[]): void => {
    if (command !== previousCommand || command === "m") {
      output += command;
      previousNumber = undefined;
    }
    for (const value of values) {
      const text = formatFixed(value, decimals);
      const needsSeparator =
        previousNumber !== undefined &&
        !text.startsWith("-") &&
        !(text.startsWith(".") && previousNumber.includes("."));
      output += (needsSeparator ? " " : "") + text;
      previousNumber = text;
    }
    // Pairs after a move are implicit line commands.
    previousCommand = command === "m" ? "l" : command;
  };

  for (const contour of contours) {
    const points: Array<{x: number; y: number}> = [];
    for (const {x, y} of contour.points) {
      const point = {x: Math.round(x * scale), y: Math.round(y * scale)};
      const last = points.at(-1);
      if (!last || last.x !== point.x || last.y !== point.y) points.push(point);
    }
    if (contour.closed && points.length > 1 && samePoint(points[0]!, points.at(-1)!)) points.pop();
    if (points.length === 0) continue;

    const [first, ...rest] = points;
    write("m", [first!.x - current.x, first!.y - current.y]);
    current = first!;
    for (const point of rest) {
      const dx = point.x - current.x;
      const dy = point.y - current.y;
      if (dy === 0) write("h", [dx]);
      else if (dx === 0) write("v", [dy]);
      else write("l", [dx, dy]);
      current = point;
    }
    if (contour.closed) {
      write("z", []);
      current = first!;
    }
  }
  return output;
}

function formatFixed(value: number, decimals: number): string {
  const scale = 10 ** decimals;
  const magnitude = Math.abs(value);
  const whole = Math.floor(magnitude / scale);
  const fraction = String(magnitude % scale).padStart(decimals, "0").replace(/0+$/, "");
  const digits = fraction === "" ? String(whole) : `${whole === 0 ? "" : whole}.${fraction}`;
  return value < 0 ? `-${digits}` : digits;
}

function samePoint(left: Point, right: Point): boolean {
  return left.x === right.x && left.y === right.y;
}
