import {execFileSync} from "node:child_process";
import {existsSync} from "node:fs";
import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {describe, expect, test} from "vitest";
import {brushes, styles} from "../config.js";
import {bend, normalizeBrush, roundedRectangle, straightLine, type Strip} from "../scripts/lib/geometry.js";
import {flattenPath, readBrush} from "../scripts/lib/path.js";
import {shapesFor} from "../scripts/lib/shapes.js";

const packageDirectory = resolve(import.meta.dirname, "..");
const dist = resolve(packageDirectory, "dist/pencil");
const noir = brushes.noir!;
const strip = normalizeBrush(readBrush(await readFile(resolve(packageDirectory, noir.source), "utf8")), noir.normalize);

describe("path flattening", () => {
  test("follows relative, smooth, and multiple subpaths", () => {
    const [square, curve] = flattenPath("m0 0h10v10h-10zM20 0c0 10 10 10 10 0s10-10 10 0z", 1);
    expect(square!.at(-1)).toEqual([0, 10]);
    expect(curve![0]).toEqual([20, 0]);
    // The smooth segment mirrors the previous control point, so it dips below the axis.
    expect(Math.min(...curve!.map(([, y]) => y))).toBeLessThan(-5);
  });

  test("rejects arcs and open paths", () => {
    expect(() => flattenPath("M0 0A5 5 0 0 1 10 10Z", 1)).toThrow(/Unsupported/);
    expect(() => flattenPath("M0 0L10 0", 1)).toThrow(/closed/);
  });
});

describe("normalized brush", () => {
  test("has matching, untapered ends", () => {
    const outer = strip.polygons.reduce((a, b) => (a.length > b.length ? a : b));
    for (const u of [0, 1]) {
      const vs = outer.filter(([x]) => Math.abs(x - u) < 1e-9).map(([, v]) => v);
      expect(Math.min(...vs)).toBeCloseTo(-0.5, 9);
      expect(Math.max(...vs)).toBeCloseTo(0.5, 9);
    }
    expect(strip.extent).toBeLessThan(0.75);
  });
});

describe("bending", () => {
  const options = {seed: 1, variant: 0, pressure: [{cycles: 3, amplitude: 0.05}]};

  test("closes loops without a seam", () => {
    const edge: Strip = {polygons: [[[0, 0.5], [1, 0.5]]], extent: 0.5};
    for (const variant of [0, 1, 2, 3]) {
      const [[start, end]] = bend(edge, roundedRectangle(0, 0, 100, 40, 6), 2, {...options, variant}) as [[number, number][]];
      expect(start![0]).toBeCloseTo(end![0], 9);
      expect(start![1]).toBeCloseTo(end![1], 9);
    }
  });

  test("keeps the stroke width regardless of shape size", () => {
    const widthAt = (width: number) => {
      const [[inner, outer]] = bend({polygons: [[[0.3, -0.5], [0.3, 0.5]]], extent: 0.5}, roundedRectangle(0, 0, width, 40, 6), 2, {
        ...options,
        pressure: [],
      }) as [[number, number][]];
      return Math.hypot(outer![0] - inner![0], outer![1] - inner![1]);
    };
    expect(widthAt(100)).toBeCloseTo(2, 9);
    expect(widthAt(400)).toBeCloseTo(2, 9);
  });

  test("tapers open lines to a point", () => {
    const [[end]] = bend({polygons: [[[0, 0.5], [1, 0.5]]], extent: 0.5}, straightLine(0, 5, 100), 2, {...options, pressure: [], taper: 10}) as [
      [number, number][],
    ];
    expect(end![1]).toBeCloseTo(5, 9);
  });
});

/** Signed distance from a point to a rounded rectangle at the origin: negative inside. */
function roundedBoxDistance([x, y]: [number, number], width: number, height: number, radius: number): number {
  const qx = Math.abs(x - width / 2) - (width / 2 - radius);
  const qy = Math.abs(y - height / 2) - (height / 2 - radius);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius;
}

describe("shapes", () => {
  const pencil = styles.pencil!;
  // The Radius brand's tokens, in pixels: radii 3, 6, and 12; sizes 16, 24, 32, and 40.
  const tokens: Record<string, number> = {
    "semantic.dimension.radius.small": 3,
    "semantic.dimension.radius.medium": 6,
    "semantic.dimension.radius.large": 12,
    "semantic.dimension.size.xSmall": 16,
    "semantic.dimension.size.small": 24,
    "semantic.dimension.size.medium": 32,
    "semantic.dimension.size.large": 40,
  };
  const shapes = shapesFor(pencil, strip, (path) => tokens[path]!);
  const epsilon = 1e-6;

  test.each([2, 4])("every stroke stays inside the element, within a %ipx band", (band) => {
    for (const shape of shapes) {
      for (let variant = 0; variant < pencil.variants; variant += 1) {
        const points = shape.draw(band, variant).polygons.flat();
        const {width, height} = shape.size;
        for (const [x, y] of points) {
          if (shape.kind === "line") {
            // Lines are drawn horizontally or vertically within a band-thick element.
            const across = shape.name.endsWith("vertical") ? x : y;
            expect(across, shape.name).toBeGreaterThanOrEqual(-epsilon);
            expect(across, shape.name).toBeLessThanOrEqual(band + epsilon);
          } else if (shape.kind === "circle") {
            const distance = Math.hypot(x - width / 2, y - height / 2);
            expect(distance, shape.name).toBeLessThanOrEqual(width / 2 + epsilon);
            expect(distance, shape.name).toBeGreaterThanOrEqual(width / 2 - band - epsilon);
          } else {
            // Depth below the element's rounded outline: inside it, and no deeper than the band.
            const depth = -roundedBoxDistance([x, y], width, height, shape.size.radius);
            expect(depth, shape.name).toBeGreaterThanOrEqual(-epsilon);
            expect(depth, shape.name).toBeLessThanOrEqual(band + epsilon);
          }
        }
      }
    }
  });

  test("the stroke fills its band", () => {
    // The slimmed brush reaches close to the band's edges where its pressure is widest.
    const points = shapes.find((shape) => shape.name === "line")!.draw(2, 0).polygons.flat();
    const ys = points.map(([, y]) => y);
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(1.6);
  });
});

describe("built pencil style for Radius", () => {
  test("references only existing masks", async () => {
    const css = await readFile(resolve(dist, "radius.css"), "utf8");
    const files = [...css.matchAll(/url\("\.\/([^"]+)"\)/g)].map((match) => match[1]!);
    expect(files.length).toBeGreaterThan(100);
    for (const file of files) expect(existsSync(resolve(dist, file)), file).toBe(true);
  });

  test("sizes shapes from the design tokens", async () => {
    const manifest = JSON.parse(await readFile(resolve(dist, "radius.json"), "utf8")) as {
      band: Record<string, number>;
      shapes: Array<{name: string; size: {radius: number; height: number}}>;
    };
    const shape = (name: string) => manifest.shapes.find((entry) => entry.name === name)!;
    expect(manifest.band).toEqual({default: 2, focus: 4});
    expect(shape("box-small").size.radius).toBe(3);
    expect(shape("box-large").size.radius).toBe(12);
    expect(shape("pill-medium").size.height).toBe(32);
  });

  test("every shape cycles through its variants", async () => {
    const css = await readFile(resolve(dist, "radius.css"), "utf8");
    expect(css).toContain('[data-outline="box-small"]:not([data-stroke-variant]):nth-child(4n + 4)');
    expect(css).toContain('[data-outline="line"][data-stroke-variant="3"]');
  });

  test("the scoped copy applies only inside its scope", async () => {
    const scoped = await readFile(resolve(dist, "radius.scoped.css"), "utf8");
    const rules = scoped.split("\n").filter((line) => /^\s*:where\(/.test(line));
    expect(rules.length).toBeGreaterThan(50);
    for (const rule of rules) expect(rule.trimStart().startsWith(':where([data-strokes="pencil"]) ')).toBe(true);
  });

  test("keeps strokes inside the element", async () => {
    const css = await readFile(resolve(dist, "radius.css"), "utf8");
    // Shapes reach back over their border band to cover the element itself, unless they opt out of the band; lines stay within it.
    expect(css).toContain("--stroke-inset: 0;");
    expect(css).toContain(':where([data-outline]:not([data-outline^="line"], [data-outline-band="none"])) {\n  --stroke-inset: calc(-1 * 0.125rem);');
    expect(css.match(/inset: calc\(-/g)).toHaveLength(1);
    expect(css).toContain("--outline-plain-border: transparent;");
  });

  test("supports edges, focus opt-out, and keeps plain focus on lines", async () => {
    const css = await readFile(resolve(dist, "radius.css"), "utf8");
    expect(css).toContain('[data-outline="line"][data-outline-edge="block-end"]');
    expect(css).toContain('[data-outline="line-vertical"][data-outline-edge="inline-start"]');
    expect(css).toContain('[data-outline-focus="none"]');
    expect(css).toMatch(/:where\(\[data-outline\]:not\(\[data-outline\^="line"\]\)\) \{\n  --outline-plain-focus/);
  });

  test("builds reproducibly", async () => {
    const before = await readFile(resolve(dist, "radius.css"), "utf8");
    const sample = await readFile(resolve(dist, "radius/box-medium-focus-2-4.svg"), "utf8");
    execFileSync(process.execPath, ["--import", "tsx", resolve(packageDirectory, "scripts/build.ts")], {cwd: packageDirectory});
    expect(await readFile(resolve(dist, "radius.css"), "utf8")).toBe(before);
    expect(await readFile(resolve(dist, "radius/box-medium-focus-2-4.svg"), "utf8")).toBe(sample);
  });
});
