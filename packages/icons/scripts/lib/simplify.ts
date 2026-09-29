import type {Contour, Point} from "./types.js";

/**
 * Ramer-Douglas-Peucker simplification with a point-to-segment error bound.
 * Closed rings are split at a deterministic farthest-point anchor. This keeps
 * contours separate and rejects collapsed or winding-reversed results; it does
 * not claim general topology preservation.
 */
export function simplifyContours(contours: Contour[], tolerance: number): Contour[] {
  if (tolerance < 0) throw new Error("Simplification tolerance cannot be negative");
  if (tolerance === 0) return contours;
  return contours.map((contour) => simplifyContour(contour, tolerance));
}

function simplifyContour(contour: Contour, tolerance: number): Contour {
  const {points, closed} = contour;
  if (!closed) return {...contour, points: simplifyOpen(points, tolerance)};
  if (points.length < 4) return contour;

  const originalArea = signedArea(points);
  if (Math.abs(originalArea) <= tolerance * tolerance) return contour;

  const opposite = farthestIndex(points, points[0]!);
  if (opposite === 0) return contour;
  const firstHalf = simplifyOpen(points.slice(0, opposite + 1), tolerance);
  const secondHalf = simplifyOpen([...points.slice(opposite), points[0]!], tolerance);
  const candidate = [...firstHalf, ...secondHalf.slice(1, -1)];
  const candidateArea = signedArea(candidate);

  if (
    candidate.length < 3 ||
    Math.abs(candidateArea) <= tolerance * tolerance ||
    Math.sign(candidateArea) !== Math.sign(originalArea)
  ) {
    return contour;
  }
  return {...contour, points: candidate};
}

export function simplifyOpen(points: Point[], tolerance: number): Point[] {
  if (points.length <= 2) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const ranges: Array<readonly [number, number]> = [[0, points.length - 1]];
  const toleranceSquared = tolerance * tolerance;

  while (ranges.length > 0) {
    const [start, end] = ranges.pop()!;
    let farthest = -1;
    let farthestDistance = toleranceSquared;
    for (let index = start + 1; index < end; index += 1) {
      const distance = pointSegmentDistanceSquared(points[index]!, points[start]!, points[end]!);
      if (distance > farthestDistance) {
        farthestDistance = distance;
        farthest = index;
      }
    }
    if (farthest !== -1) {
      keep[farthest] = 1;
      ranges.push([start, farthest], [farthest, end]);
    }
  }

  return points.filter((_, index) => keep[index] === 1);
}

export function maximumDeviation(
  original: Point[],
  simplified: Point[],
  closed: boolean,
): number {
  if (simplified.length === 0) return Number.POSITIVE_INFINITY;
  if (simplified.length === 1) {
    return Math.max(...original.map((point) => Math.hypot(point.x - simplified[0]!.x, point.y - simplified[0]!.y)));
  }

  let maximumSquared = 0;
  const segmentCount = closed ? simplified.length : simplified.length - 1;
  for (const point of original) {
    let closestSquared = Number.POSITIVE_INFINITY;
    for (let index = 0; index < segmentCount; index += 1) {
      const distance = pointSegmentDistanceSquared(
        point,
        simplified[index]!,
        simplified[(index + 1) % simplified.length]!,
      );
      closestSquared = Math.min(closestSquared, distance);
    }
    maximumSquared = Math.max(maximumSquared, closestSquared);
  }
  return Math.sqrt(maximumSquared);
}

export function signedArea(points: Point[]): number {
  let twiceArea = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index]!;
    const next = points[(index + 1) % points.length]!;
    twiceArea += current.x * next.y - next.x * current.y;
  }
  return twiceArea / 2;
}

function farthestIndex(points: Point[], origin: Point): number {
  let result = 0;
  let maximum = -1;
  for (let index = 1; index < points.length; index += 1) {
    const point = points[index]!;
    const distance = (point.x - origin.x) ** 2 + (point.y - origin.y) ** 2;
    if (distance > maximum) {
      maximum = distance;
      result = index;
    }
  }
  return result;
}

function pointSegmentDistanceSquared(point: Point, start: Point, end: Point): number {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  if (deltaX === 0 && deltaY === 0) {
    return (point.x - start.x) ** 2 + (point.y - start.y) ** 2;
  }
  const projection = Math.max(
    0,
    Math.min(
      1,
      ((point.x - start.x) * deltaX + (point.y - start.y) * deltaY) /
        (deltaX * deltaX + deltaY * deltaY),
    ),
  );
  const closestX = start.x + projection * deltaX;
  const closestY = start.y + projection * deltaY;
  return (point.x - closestX) ** 2 + (point.y - closestY) ** 2;
}
