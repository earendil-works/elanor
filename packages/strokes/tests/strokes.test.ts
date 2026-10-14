import {execFileSync} from "node:child_process";
import {existsSync} from "node:fs";
import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {describe, expect, test} from "vitest";
import {brushes, styles} from "../config.js";
import {bend, normalizeBrush, roundedRectangle, straightLine, type Strip} from "../scripts/lib/geometry.js";
import {flattenPath, readBrush} from "../scripts/lib/path.js";
import {marksFor, shapesFor} from "../scripts/lib/shapes.js";

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

  test("puts the smoother edge inside", () => {
    const range = ([nearest, farthest]: [number, number]) => farthest - nearest;
    expect(range(strip.edges.inner)).toBeLessThan(range(strip.edges.outer));
  });
});

describe("bending", () => {
  const options = {seed: 1, variant: 0, pressure: [{cycles: 3, amplitude: 0.05}]};

  test("closes loops without a seam", () => {
    const edge: Strip = {polygons: [[[0, 0.5], [1, 0.5]]], extent: 0.5, edges: {inner: [0.5, 0.5], outer: [0.5, 0.5]}};
    for (const variant of [0, 1, 2, 3]) {
      const [[start, end]] = bend(edge, roundedRectangle(0, 0, 100, 40, 6), 2, {...options, variant}) as [[number, number][]];
      expect(start![0]).toBeCloseTo(end![0], 9);
      expect(start![1]).toBeCloseTo(end![1], 9);
    }
  });

  test("keeps the stroke width regardless of shape size", () => {
    const widthAt = (width: number) => {
      const [[inner, outer]] = bend({polygons: [[[0.3, -0.5], [0.3, 0.5]]], extent: 0.5, edges: {inner: [0.5, 0.5], outer: [0.5, 0.5]}}, roundedRectangle(0, 0, width, 40, 6), 2, {
        ...options,
        pressure: [],
      }) as [[number, number][]];
      return Math.hypot(outer![0] - inner![0], outer![1] - inner![1]);
    };
    expect(widthAt(100)).toBeCloseTo(2, 9);
    expect(widthAt(400)).toBeCloseTo(2, 9);
  });

  test("tapers open lines to a point", () => {
    const [[end]] = bend({polygons: [[[0, 0.5], [1, 0.5]]], extent: 0.5, edges: {inner: [0.5, 0.5], outer: [0.5, 0.5]}}, straightLine(0, 5, 100), 2, {...options, pressure: [], ends: {start: {shape: "point", length: 10}, end: {shape: "point", length: 10}}}) as [
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

/** Even-odd point-in-polygon test. */
function contains(polygon: [number, number][], [x, y]: [number, number]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, yi] = polygon[i]!;
    const [xj, yj] = polygon[j]!;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
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

  test.each([2, 4])("every stroke stays inside the element and covers only the edge of a %ipx band's padding", (band) => {
    for (const shape of shapes) {
      for (let variant = 0; variant < pencil.variants; variant += 1) {
        const points = shape.draw(band, variant).polygons.flat();
        const {width, height, radius} = shape.size;
        for (const [x, y] of points) {
          if (shape.kind === "line") {
            // Lines are drawn horizontally or vertically within a band-thick element.
            const across = shape.name.endsWith("vertical") ? x : y;
            expect(across, shape.name).toBeGreaterThanOrEqual(-epsilon);
            expect(across, shape.name).toBeLessThanOrEqual(band + epsilon);
          } else {
            // Depth below the element's rounded outline: inside it, and past the band by little more than the overlap.
            const depth = -roundedBoxDistance([x, y], width, height, radius);
            expect(depth, shape.name).toBeGreaterThanOrEqual(-epsilon);
            expect(depth, shape.name).toBeLessThanOrEqual(1.5 * (band + pencil.overlap));
          }
        }
      }
    }
  });

  test.each([2, 4])("every shape covers the edge of the background inside a %ipx band", (band) => {
    // The background starts at the band; the mask covers the overlap on both sides of it.
    for (const shape of shapes.filter(({kind}) => kind !== "line")) {
      const {width, height, radius} = shape.size;
      for (let variant = 0; variant < pencil.variants; variant += 1) {
        const {polygons, core} = shape.draw(band, variant);
        // Each layer fills even-odd; the mask is their union.
        const covered = (point: [number, number]) => [polygons, core].some((layer) => layer.filter((polygon) => contains(polygon, point)).length % 2 === 1);
        for (const depth of [band - pencil.overlap + 0.01, band, band + pencil.overlap - 0.01]) {
          const path = roundedRectangle(depth, depth, width - 2 * depth, height - 2 * depth, Math.max(radius - depth, 0));
          for (let i = 0; i < 400; i += 1) {
            const [x, y] = path.at((i / 400) * path.length);
            expect(covered([x, y]), `${shape.name} variant ${variant} at depth ${depth}`).toBe(true);
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

describe("marks", () => {
  const pencil = styles.pencil!;
  const tokens: Record<string, number> = {"semantic.dimension.size.xSmall": 16, "semantic.dimension.borderWidth.medium": 2};
  const marks = Object.fromEntries(marksFor(pencil, strip, (path) => tokens[path]!).map((mark) => [mark.name, mark]));

  test("stay inside their square", () => {
    for (const {name, layers, size} of Object.values(marks)) {
      for (const [x, y] of layers.flat(2)) {
        expect(x, name).toBeGreaterThanOrEqual(0);
        expect(x, name).toBeLessThanOrEqual(size);
        expect(y, name).toBeGreaterThanOrEqual(0);
        expect(y, name).toBeLessThanOrEqual(size);
      }
    }
  });

  test("the check's long arm rises to the right", () => {
    const points = marks.check!.layers.flat(2);
    const top = points.reduce((a, b) => (b[1] < a[1] ? b : a));
    const bottom = points.reduce((a, b) => (b[1] > a[1] ? b : a));
    expect(top[0]).toBeGreaterThan(bottom[0]);
  });

  test("the dot is a filled circle inside its square", () => {
    const {layers, size} = marks.dot!;
    for (const [x, y] of layers.flat(2)) expect(Math.hypot(x - size / 2, y - size / 2)).toBeLessThanOrEqual(size / 2 + 1e-6);
    const [, core] = layers;
    expect(contains(core![0]!, [size / 2, size / 2])).toBe(true);
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
    expect(css).toContain("--outline-background-clip: padding-box;");
  });

  test("defines inline marks, on the root or on the scope", async () => {
    const css = await readFile(resolve(dist, "radius.css"), "utf8");
    const scoped = await readFile(resolve(dist, "radius.scoped.css"), "utf8");
    for (const name of ["check", "dash", "dot"]) {
      expect(css).toContain(`--mark-${name}: url("data:image/svg+xml,`);
    }
    expect(css).toMatch(/:where\(:root\) \{\n  --mark-check/);
    expect(scoped).toMatch(/:where\(\[data-strokes="pencil"\]\) \{\n  --mark-check/);
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
