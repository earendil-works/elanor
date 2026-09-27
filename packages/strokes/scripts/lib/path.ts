export type Point = [number, number];
export type Polygon = Point[];

export interface Brush {
  viewBox: [number, number, number, number];
  /** Closed contours; holes are separate contours filled with the even-odd rule. */
  polygons: Polygon[];
}

/**
 * Reads a brush source: an SVG containing only closed, filled paths. Curves are
 * flattened into short line segments of at most `step` source units.
 */
export function readBrush(svg: string, step = 0.08): Brush {
  if (/<(?:image|use|filter|mask|clipPath|rect|circle|ellipse|polygon|polyline|line|g)\b|\b(?:transform|stroke)\s*=/i.test(svg)) {
    throw new Error("A brush must contain only paths without transforms, strokes, groups, or effects");
  }
  const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1]?.trim().split(/[\s,]+/).map(Number);
  if (!viewBox || viewBox.length !== 4 || viewBox.some((value) => !Number.isFinite(value)) || !(viewBox[2]! > 0 && viewBox[3]! > 0)) {
    throw new Error("A brush needs a valid viewBox");
  }
  const polygons = [...svg.matchAll(/<path\b[^>]*\bd="([^"]+)"/g)].flatMap((match) => flattenPath(match[1]!, step));
  if (polygons.length === 0) throw new Error("A brush has no paths");
  return {viewBox: viewBox as Brush["viewBox"], polygons};
}

const tokenPattern = /[A-Za-z]|[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/g;
const counts: Record<string, number> = {M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, Z: 0};

/** Flattens SVG path data (all commands except arcs) into closed polygons. */
export function flattenPath(d: string, step: number): Polygon[] {
  const tokens = d.match(tokenPattern) ?? [];
  const polygons: Polygon[] = [];
  let polygon: Polygon | undefined;
  let current: Point = [0, 0];
  let start: Point = [0, 0];
  let command = "";
  let previousCubic: Point | undefined;
  let previousQuadratic: Point | undefined;
  let index = 0;

  const close = () => {
    if (polygon && polygon.length > 2) polygons.push(polygon);
    polygon = undefined;
  };
  const curve = (controls: Point[]) => {
    // Drawing after Z without a move continues from the subpath start.
    polygon ??= [current];
    const length = controls.slice(1).reduce((sum, point, i) => sum + Math.hypot(point[0] - controls[i]![0], point[1] - controls[i]![1]), 0);
    const segments = Math.max(1, Math.ceil(length / step));
    for (let i = 1; i <= segments; i += 1) {
      const t = i / segments;
      let work = controls;
      while (work.length > 1) work = work.slice(1).map((point, j) => [work[j]![0] * (1 - t) + point[0] * t, work[j]![1] * (1 - t) + point[1] * t] as Point);
      polygon!.push(work[0]!);
    }
    current = controls.at(-1)!;
  };

  while (index < tokens.length) {
    const token = tokens[index]!;
    if (/[A-Za-z]/.test(token)) {
      command = token;
      index += 1;
    }
    const type = command.toUpperCase();
    if (!(type in counts)) throw new Error(`Unsupported path command ${command}`);
    const relative = command !== type;
    const values = tokens.slice(index, index + counts[type]!).map(Number);
    index += counts[type]!;
    const point = (x: number, y: number): Point => (relative ? [current[0] + x, current[1] + y] : [x, y]);
    const reflect = (control: Point | undefined): Point =>
      control ? [2 * current[0] - control[0], 2 * current[1] - control[1]] : current;
    let cubic: Point | undefined;
    let quadratic: Point | undefined;

    switch (type) {
      case "M":
        close();
        current = point(values[0]!, values[1]!);
        start = current;
        polygon = [current];
        command = relative ? "l" : "L";
        break;
      case "L":
        curve([current, point(values[0]!, values[1]!)]);
        break;
      case "H":
        curve([current, [relative ? current[0] + values[0]! : values[0]!, current[1]]]);
        break;
      case "V":
        curve([current, [current[0], relative ? current[1] + values[0]! : values[0]!]]);
        break;
      case "C":
        cubic = point(values[2]!, values[3]!);
        curve([current, point(values[0]!, values[1]!), cubic, point(values[4]!, values[5]!)]);
        break;
      case "S":
        cubic = point(values[0]!, values[1]!);
        curve([current, reflect(previousCubic), cubic, point(values[2]!, values[3]!)]);
        break;
      case "Q":
        quadratic = point(values[0]!, values[1]!);
        curve([current, quadratic, point(values[2]!, values[3]!)]);
        break;
      case "T":
        quadratic = reflect(previousQuadratic);
        curve([current, quadratic, point(values[0]!, values[1]!)]);
        break;
      case "Z":
        close();
        current = start;
        break;
    }
    // Smooth commands reflect only the last control point of their own curve type.
    previousCubic = cubic;
    previousQuadratic = quadratic;
  }
  if (polygon) throw new Error("Brush paths must be closed with Z");
  return polygons;
}
