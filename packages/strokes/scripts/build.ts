import {mkdir, readFile, rm, writeFile} from "node:fs/promises";
import {createRequire} from "node:module";
import {resolve} from "node:path";
import {brushes, type StrokeStyle, styles} from "../config.js";
import {bend, maskSvg, normalizeBrush, reach, roundedRectangle, straightLine, type Strip} from "./lib/geometry.js";
import {type Polygon, readBrush} from "./lib/path.js";

const packageDirectory = resolve(import.meta.dirname, "..");
const outputDirectory = resolve(packageDirectory, "dist");
const PIXELS_PER_REM = 16;
/** Length of the stretchable middle of each edge in the canonical drawing, in pixels. */
const CANONICAL_EDGE = 64;
/**
 * Stretched middles extend this far under their neighbors, in pixels. Slice
 * boundaries often land on fractional device pixels, where two abutting layers
 * would each paint partial coverage and leave a hairline gap.
 */
const OVERLAP = 0.5;

type Region = [number, number, number, number];
type Slices = Array<Region | null>;

interface Shape {
  name: string;
  kind: "box" | "circle" | "line";
  /** Pixel size of the element the shape was drawn for (lines: length 0). */
  size: {width: number; height: number; radius: number};
  /** Draws the shape at one stroke width; returns polygons, canvas, slices, and CSS geometry. */
  draw(width: number, variant: number): {polygons: Polygon[]; slices: Slices; bleed: number; slice: number};
}

const rem = (px: number) => `${Math.round((px / PIXELS_PER_REM) * 10000) / 10000}rem`;

async function tokenPixels(brand: string): Promise<(path: string) => number> {
  const file = createRequire(import.meta.url).resolve(`@earendil-works/design-tokens/${brand}.catalog.json`);
  const catalog = JSON.parse(await readFile(file, "utf8")) as {tokens: Array<{path: string; values: {light: {value: number; unit: string}}}>};
  const tokens = new Map(catalog.tokens.map((token) => [token.path, token.values.light]));
  return (path) => {
    const value = tokens.get(path);
    if (!value || typeof value.value !== "number") throw new Error(`Token ${path} is not a dimension in the ${brand} build`);
    return value.unit === "rem" ? value.value * PIXELS_PER_REM : value.value;
  };
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

function shapesFor(style: StrokeStyle, strip: Strip, pixels: (path: string) => number): Shape[] {
  const options = (variant: number) => ({seed: style.seed, variant, pressure: style.pressure});
  const bleedFor = (width: number) => Math.ceil((reach(strip, width, style.pressure) + 0.25) * 4) / 4;

  const rounded = (name: string, kind: "box", elementWidth: number, elementHeight: number, radius: number): Shape => ({
    name,
    kind,
    size: {width: elementWidth, height: elementHeight, radius},
    draw(width, variant) {
      const bleed = bleedFor(width);
      const slice = bleed + radius;
      const backbone = roundedRectangle(bleed, bleed, elementWidth, elementHeight, radius);
      const polygons = bend(strip, backbone, width, options(variant));
      return {polygons, slices: nineSlice(elementWidth + 2 * bleed, elementHeight + 2 * bleed, slice), bleed, slice};
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
    shapes.push({
      name: `circle-${name}`,
      kind: "circle",
      size: {width: diameter, height: diameter, radius: diameter / 2},
      draw(width, variant) {
        const bleed = bleedFor(width);
        const backbone = roundedRectangle(bleed, bleed, diameter, diameter, diameter / 2);
        const canvas = diameter + 2 * bleed;
        return {polygons: bend(strip, backbone, width, options(variant)), slices: [[0, 0, canvas, canvas]], bleed, slice: 0};
      },
    });
  }
  const {taper} = style.shapes.lines;
  for (const vertical of [false, true]) {
    shapes.push({
      name: vertical ? "line-vertical" : "line",
      kind: "line",
      size: {width: 0, height: 0, radius: 0},
      draw(width, variant) {
        const bleed = bleedFor(width);
        const length = 2 * taper + CANONICAL_EDGE;
        let polygons = bend(strip, straightLine(0, bleed, length), width, {...options(variant), taper});
        const regions: Region[] = [
          [0, 0, taper, 2 * bleed],
          [taper - OVERLAP, 0, length - taper + OVERLAP, 2 * bleed],
          [length - taper, 0, length, 2 * bleed],
        ];
        if (!vertical) return {polygons, slices: regions, bleed, slice: taper};
        polygons = polygons.map((polygon) => polygon.map(([x, y]): [number, number] => [y, x]));
        return {polygons, slices: regions.map(([l, t, r, b]): Region => [t, l, b, r]), bleed, slice: taper};
      },
    });
  }
  return shapes;
}

const boxPositions = "left top, center top, right top, left center, right center, left bottom, center bottom, right bottom";

function boxSizes(slice: number): string {
  const s = rem(slice);
  const middle = `calc(100% - ${rem(2 * slice - 2 * OVERLAP)})`;
  return [`${s} ${s}`, `${middle} ${s}`, `${s} ${s}`, `${s} ${middle}`, `${s} ${middle}`, `${s} ${s}`, `${middle} ${s}`, `${s} ${s}`].join(", ");
}

function geometry(shape: Shape, drawn: {bleed: number; slice: number}, prefix: "" | "focus-"): string[] {
  const property = (name: string) => `--stroke-${prefix}${name}`;
  if (shape.kind === "box") {
    return [
      `${property("inset")}: ${rem(-drawn.bleed)};`,
      ...(prefix ? [] : [`--stroke-mask-position: ${boxPositions};`]),
      `${property("mask-size")}: ${boxSizes(drawn.slice)};`,
    ];
  }
  if (shape.kind === "circle") {
    return [
      `${property("inset")}: ${rem(-drawn.bleed)};`,
      ...(prefix ? [] : ["--stroke-mask-position: center;"]),
      `${property("mask-size")}: 100% 100%;`,
    ];
  }
  const vertical = shape.name.endsWith("vertical");
  const cap = rem(drawn.slice);
  const middle = `calc(100% - ${rem(2 * drawn.slice - 2 * OVERLAP)})`;
  return [
    `--stroke-inset: ${vertical ? `0 calc(50% - ${rem(drawn.bleed)})` : `calc(50% - ${rem(drawn.bleed)}) 0`};`,
    `--stroke-mask-position: ${vertical ? "center top, center center, center bottom" : "left center, center center, right center"};`,
    `--stroke-mask-size: ${vertical ? `100% ${cap}, 100% ${middle}, 100% ${cap}` : `${cap} 100%, ${middle} 100%, ${cap} 100%`};`,
  ];
}

function baseCss(fallbackWidth: number): string {
  const width = rem(fallbackWidth);
  return `/* Generated by @earendil-works/elanor-strokes. */

:where([data-stroke]) {
  position: relative;
  --stroke-color: var(--semantic-color-border-primary);
  --stroke-focus-color: var(--semantic-color-focus-ring);
}

/* The stroke is centered on the element's edge: its outer half is paint only,
   so layout and padding are unchanged, and the fill ends beneath it. */
:where([data-stroke])::after {
  content: "";
  position: absolute;
  inset: var(--stroke-inset);
  pointer-events: none;
  background-color: var(--stroke-color);
  mask-image: var(--stroke-images);
  mask-position: var(--stroke-mask-position);
  mask-size: var(--stroke-mask-size);
  mask-repeat: no-repeat;
}

:where([data-stroke]:not([data-stroke^="line"])):is(:focus-visible, :has(:focus-visible))::after {
  inset: var(--stroke-focus-inset);
  background-color: var(--stroke-focus-color);
  mask-image: var(--stroke-focus-images);
  mask-size: var(--stroke-focus-mask-size);
}

@supports not (mask-image: none) {
  :where([data-stroke]:not([data-stroke^="line"]))::after {
    inset: calc(${width} / -2);
    border: ${width} solid var(--stroke-color);
    border-radius: inherit;
    background: none;
  }

  :where([data-stroke]:not([data-stroke^="line"])):is(:focus-visible, :has(:focus-visible))::after {
    border-color: var(--stroke-focus-color);
  }
}

@media (forced-colors: active) {
  :where([data-stroke]:not([data-stroke^="line"]))::after {
    inset: calc(${width} / -2);
    border: ${width} solid CanvasText;
    border-radius: inherit;
    background: none;
    mask: none;
  }

  :where([data-stroke]:not([data-stroke^="line"])):is(:focus-visible, :has(:focus-visible))::after {
    border-color: Highlight;
  }

  :where([data-stroke^="line"])::after {
    background-color: CanvasText;
    forced-color-adjust: none;
    mask: none;
  }
}
`;
}

const styleNames = Object.keys(styles);
await rm(outputDirectory, {recursive: true, force: true});

for (const styleName of styleNames) {
  const style = styles[styleName]!;
  const brushConfig = brushes[style.brush];
  if (!brushConfig) throw new Error(`Style ${styleName} uses unknown brush ${style.brush}`);
  if (!Number.isInteger(style.variants) || style.variants < 1) throw new Error("variants must be a positive integer");

  const strip = normalizeBrush(readBrush(await readFile(resolve(packageDirectory, brushConfig.source), "utf8")), brushConfig.normalize);
  const pixels = await tokenPixels(style.tokenBrand);
  const widths = {default: pixels(style.thickness.default), focus: pixels(style.thickness.focus)};
  const assetDirectory = resolve(outputDirectory, styleName);
  await mkdir(assetDirectory, {recursive: true});

  const css = [baseCss(widths.default)];
  const manifest: Array<{name: string; kind: string; size: Shape["size"]}> = [];
  for (const shape of shapesFor(style, strip, pixels)) {
    manifest.push({name: shape.name, kind: shape.kind, size: shape.size});
    const thicknesses = shape.kind === "line" ? (["default"] as const) : (["default", "focus"] as const);
    const images: Record<string, string[]> = {};
    const drawnGeometry: Record<string, {bleed: number; slice: number}> = {};

    for (const thickness of thicknesses) {
      for (let variant = 0; variant < style.variants; variant += 1) {
        const drawn = shape.draw(widths[thickness], variant);
        drawnGeometry[thickness] = drawn;
        const urls: string[] = [];
        for (const [index, region] of drawn.slices.entries()) {
          if (!region) {
            urls.push("none");
            continue;
          }
          const file = `${shape.name}-${thickness}-${variant}-${index}.svg`;
          await writeFile(resolve(assetDirectory, file), maskSvg(drawn.polygons, region));
          urls.push(`url("./${styleName}/${file}")`);
        }
        images[`${thickness}-${variant}`] = urls;
      }
    }

    const selector = `[data-stroke="${shape.name}"]`;
    const imageDeclarations = (variant: number) => [
      `--stroke-images: ${images[`default-${variant}`]!.join(", ")};`,
      ...(shape.kind === "line" ? [] : [`--stroke-focus-images: ${images[`focus-${variant}`]!.join(", ")};`]),
    ];
    css.push(
      `:where(${selector}) {\n${[
        ...geometry(shape, drawnGeometry.default!, ""),
        ...(shape.kind === "line" ? [] : geometry(shape, drawnGeometry.focus!, "focus-")),
        ...imageDeclarations(0),
      ]
        .map((line) => `  ${line}`)
        .join("\n")}\n}`,
    );
    // Siblings cycle through the variants unless one is chosen with data-stroke-variant.
    for (let variant = 1; variant < style.variants; variant += 1) {
      css.push(
        `:where(${selector}[data-stroke-variant="${variant}"], ${selector}:not([data-stroke-variant]):nth-child(${style.variants}n + ${variant + 1})) {\n${imageDeclarations(variant)
          .map((line) => `  ${line}`)
          .join("\n")}\n}`,
      );
    }
  }

  await writeFile(resolve(outputDirectory, `${styleName}.css`), `${css.join("\n\n")}\n`);
  await writeFile(
    resolve(outputDirectory, `${styleName}.json`),
    `${JSON.stringify({style: styleName, variants: style.variants, thickness: widths, shapes: manifest}, null, 2)}\n`,
  );
  console.log(`Built ${styleName}: ${manifest.length} shapes × ${style.variants} variants.`);
}
