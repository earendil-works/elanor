import {svgPathProperties} from "svg-path-properties";
import {SVGPathData} from "svg-pathdata";
import type {SVGCommand} from "svg-pathdata";
import type {Contour, Point} from "./types.js";

export function flattenPath(pathData: string, step: number): Contour[] {
  if (!(step > 0)) throw new Error("Sampling step must be positive");
  const commands = new SVGPathData(pathData).toAbs().commands;
  const groups: SVGCommand[][] = [];

  for (const command of commands) {
    if (command.type === SVGPathData.MOVE_TO) groups.push([command]);
    else {
      const current = groups.at(-1);
      if (!current) throw new Error("Path data must begin with a move command");
      current.push(command);
    }
  }

  return groups.map((commands) => sampleContour(commands, step));
}

function sampleContour(commands: SVGCommand[], step: number): Contour {
  const first = commands[0];
  if (!first || first.type !== SVGPathData.MOVE_TO) {
    throw new Error("Contour must begin with a move command");
  }
  const closed = commands.at(-1)?.type === SVGPathData.CLOSE_PATH;
  const properties = new svgPathProperties(new SVGPathData(commands).encode());
  const points: Point[] = [{x: first.x, y: first.y}];
  for (const part of properties.getParts()) {
    if (!Number.isFinite(part.length)) throw new Error("Could not measure path contour");
    const segmentCount = Math.max(1, Math.ceil(part.length / step));
    for (let index = 1; index <= segmentCount; index += 1) {
      const point = part.getPointAtLength((index / segmentCount) * part.length);
      if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
        throw new Error("Path sampling produced a non-finite point");
      }
      points.push(point);
    }
  }
  if (closed && samePoint(points[0]!, points.at(-1)!)) points.pop();
  return {points: removeAdjacentDuplicates(points), closed};
}

function samePoint(left: Point, right: Point): boolean {
  return left.x === right.x && left.y === right.y;
}

function removeAdjacentDuplicates(points: Point[]): Point[] {
  return points.filter((point, index) => {
    const previous = points[index - 1];
    return !previous || point.x !== previous.x || point.y !== previous.y;
  });
}

export function contoursToPathData(contours: Contour[], precision = 6): string {
  return contours
    .filter(({points}) => points.length > 0)
    .map(({points, closed}) => {
      const first = points[0];
      if (!first) return "";
      const lines = points
        .slice(1)
        .map((point) => `L${format(point.x, precision)} ${format(point.y, precision)}`)
        .join("");
      return `M${format(first.x, precision)} ${format(first.y, precision)}${lines}${closed ? "Z" : ""}`;
    })
    .join("");
}

function format(value: number, precision: number): string {
  const rounded = Number(value.toFixed(precision));
  return Object.is(rounded, -0) ? "0" : String(rounded);
}
