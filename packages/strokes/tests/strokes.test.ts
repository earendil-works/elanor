import {execFileSync} from "node:child_process";
import {existsSync} from "node:fs";
import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {describe, expect, test} from "vitest";
import {brushes} from "../config.js";
import {bend, normalizeBrush, roundedRectangle, straightLine, type Strip} from "../scripts/lib/geometry.js";
import {flattenPath, readBrush} from "../scripts/lib/path.js";

const packageDirectory = resolve(import.meta.dirname, "..");
const dist = resolve(packageDirectory, "dist");
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

describe("built pencil style", () => {
  test("references only existing masks", async () => {
    const css = await readFile(resolve(dist, "pencil.css"), "utf8");
    const files = [...css.matchAll(/url\("\.\/([^"]+)"\)/g)].map((match) => match[1]!);
    expect(files.length).toBeGreaterThan(100);
    for (const file of files) expect(existsSync(resolve(dist, file)), file).toBe(true);
  });

  test("sizes shapes from the design tokens", async () => {
    const manifest = JSON.parse(await readFile(resolve(dist, "pencil.json"), "utf8")) as {
      thickness: Record<string, number>;
      shapes: Array<{name: string; size: {radius: number; height: number}}>;
    };
    const shape = (name: string) => manifest.shapes.find((entry) => entry.name === name)!;
    expect(manifest.thickness).toEqual({default: 2, focus: 4});
    expect(shape("box-small").size.radius).toBe(3);
    expect(shape("box-large").size.radius).toBe(12);
    expect(shape("pill-medium").size.height).toBe(32);
  });

  test("every shape cycles through its variants", async () => {
    const css = await readFile(resolve(dist, "pencil.css"), "utf8");
    expect(css).toContain('[data-stroke="box-small"]:not([data-stroke-variant]):nth-child(4n + 4)');
    expect(css).toContain('[data-stroke="line"][data-stroke-variant="3"]');
  });

  test("the scoped copy applies only inside its scope", async () => {
    const scoped = await readFile(resolve(dist, "pencil.scoped.css"), "utf8");
    const rules = scoped.split("\n").filter((line) => /^\s*:where\(/.test(line));
    expect(rules.length).toBeGreaterThan(50);
    for (const rule of rules) expect(rule.trimStart().startsWith(':where([data-strokes="pencil"]) ')).toBe(true);
  });

  test("supports edges, focus opt-out, and keeps plain focus on lines", async () => {
    const css = await readFile(resolve(dist, "pencil.css"), "utf8");
    expect(css).toContain('[data-stroke="line"][data-stroke-edge="block-end"]');
    expect(css).toContain('[data-stroke="line-vertical"][data-stroke-edge="inline-start"]');
    expect(css).toContain('[data-stroke-focus="none"]');
    expect(css).toMatch(/:where\(\[data-stroke\]:not\(\[data-stroke\^="line"\]\)\) \{\n  --stroke-plain-outline/);
  });

  test("builds reproducibly", async () => {
    const before = await readFile(resolve(dist, "pencil.css"), "utf8");
    const sample = await readFile(resolve(dist, "pencil/box-medium-focus-2-4.svg"), "utf8");
    execFileSync(process.execPath, ["--import", "tsx", resolve(packageDirectory, "scripts/build.ts")], {cwd: packageDirectory});
    expect(await readFile(resolve(dist, "pencil.css"), "utf8")).toBe(before);
    expect(await readFile(resolve(dist, "pencil/box-medium-focus-2-4.svg"), "utf8")).toBe(sample);
  });
});
