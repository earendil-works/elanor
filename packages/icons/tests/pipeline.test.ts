import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {describe, expect, test} from "vitest";
import {pipelineConfig} from "../config.js";
import {processSvg} from "../scripts/lib/pipeline.js";
import {
  maximumDeviation,
  signedArea,
  simplifyContours,
} from "../scripts/lib/simplify.js";
import type {Contour, Point} from "../scripts/lib/types.js";

const packageDirectory = resolve(import.meta.dirname, "..");

describe("pipeline", () => {
  test("is deterministic", async () => {
    const source = await readFile(resolve(packageDirectory, "sources/search.svg"), "utf8");
    const first = processSvg(source, pipelineConfig, "search.svg");
    const second = processSvg(source, pipelineConfig, "search.svg");
    expect(first.svg).toBe(second.svg);
    expect(first.artwork).toEqual(second.artwork);
  });

  test("each stage can be disabled independently", () => {
    const source = '<svg width="20" height="20"><path d="M1 1L19 1L19 19L1 19Z"/></svg>';
    for (const [boiling, simplification, optimization] of [
      [false, false, false],
      [true, false, false],
      [false, true, false],
      [false, false, true],
    ] as const) {
      const config = {
        ...pipelineConfig,
        boiling: {...pipelineConfig.boiling, enabled: boiling},
        simplification: {...pipelineConfig.simplification, enabled: simplification},
        optimization: {...pipelineConfig.optimization, enabled: optimization},
      };
      expect(() => processSvg(source, config)).not.toThrow();
    }
  });
});

describe("bounded simplification", () => {
  test("keeps error within tolerance and preserves rings, closure, holes, and winding", () => {
    const outer = sampledSquare(0, 0, 10, false);
    const hole = sampledSquare(3, 3, 4, true);
    const simplified = simplifyContours([outer, hole], 0.05);

    expect(simplified).toHaveLength(2);
    for (const [index, contour] of simplified.entries()) {
      const original = [outer, hole][index]!;
      expect(contour.closed).toBe(true);
      expect(contour.points.length).toBeGreaterThanOrEqual(3);
      expect(Math.sign(signedArea(contour.points))).toBe(Math.sign(signedArea(original.points)));
      expect(maximumDeviation(original.points, contour.points, true)).toBeLessThanOrEqual(0.05 + 1e-12);
    }
  });

  test("does not collapse tiny closed contours", () => {
    const tiny: Contour = {
      closed: true,
      points: [
        {x: 0, y: 0},
        {x: 0.001, y: 0},
        {x: 0, y: 0.001},
        {x: 0.0002, y: 0.0002},
      ],
    };
    expect(simplifyContours([tiny], 0.1)[0]).toEqual(tiny);
  });
});

function sampledSquare(x: number, y: number, size: number, reverse: boolean): Contour {
  const corners: Point[] = [
    {x, y},
    {x: x + size, y},
    {x: x + size, y: y + size},
    {x, y: y + size},
  ];
  const points: Point[] = [];
  for (let side = 0; side < corners.length; side += 1) {
    const start = corners[side]!;
    const end = corners[(side + 1) % corners.length]!;
    for (let step = 0; step < 20; step += 1) {
      points.push({
        x: start.x + ((end.x - start.x) * step) / 20,
        y: start.y + ((end.y - start.y) * step) / 20,
      });
    }
  }
  return {closed: true, points: reverse ? points.reverse() : points};
}
