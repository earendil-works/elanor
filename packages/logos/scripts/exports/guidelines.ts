import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {type BrandId, brands, clearSpace, gridUnit, type LogoKind} from "../../config.js";
import {packageDirectory} from "../lib/compose.js";
import {svgToPng} from "../lib/raster.js";
import type {Asset, ExportContext, ExportPlugin, TreatmentId} from "./plugin.js";

const guidelinesDirectory = resolve(packageDirectory, "guidelines");

export interface GuidelinesOptions {
  /** Documents by the brand they belong to, each covering the listed brands. */
  documents: Partial<Record<BrandId, BrandId[]>>;
  /** The generated clear-space illustration. */
  clearSpace: {
    /** Assets shown for each covered brand, side by side. */
    kinds: LogoKind[];
    treatment: TreatmentId;
    /** Tokens, resolved in the document brand's build, for the clear-space area and the grid lines. */
    colors: {area: string; grid: string};
    /** Pixel width of the image. */
    width: number;
  };
}

/**
 * Brand guidelines per document, from guidelines/template.md and a short
 * description per brand in guidelines/brands/<brand>.md, plus a clear-space
 * illustration drawn from the built artwork. Writes
 * guidelines/<document>/BRAND-GUIDELINES.md and clear-space.png.
 */
export function guidelines(options: GuidelinesOptions): ExportPlugin {
  return {
    name: "guidelines",
    async run(context) {
      const template = await readFile(resolve(guidelinesDirectory, "template.md"), "utf8");
      const documents: Record<string, {document: string; clearSpace: string}> = {};
      for (const [document, covered] of Object.entries(options.documents) as Array<[BrandId, BrandId[]]>) {
        const names = covered.map((brand) => brands[brand].name);
        const directory = `guidelines/${document}`;
        const image = await clearSpaceSvg(context, document, covered, options.clearSpace);
        const values: Record<string, string> = {
          title: brands[document].name,
          names: list(names),
          about: (await Promise.all(covered.map((brand) => readFile(resolve(guidelinesDirectory, "brands", `${brand}.md`), "utf8"))))
            .map((text) => text.trim())
            .join("\n\n"),
          writeNames: `Write the ${names.length === 1 ? "name" : "names"} as ${list(names.map((name) => `**${name}**`))} in prose.`,
          // An HTML image, so Markdown renderers show it as is rather than processing it.
          clearSpace: `<img src="clear-space.png" alt="${list(names)} logos with one grid unit of clear space on every side" width="800">`,
        };
        const markdown = template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
          const value = values[key];
          if (value === undefined) throw new Error(`guidelines/template.md: unknown placeholder {{${key}}}`);
          return value;
        });
        documents[document] = {
          document: await context.write(`${directory}/BRAND-GUIDELINES.md`, markdown),
          clearSpace: await context.write(`${directory}/clear-space.png`, await svgToPng(image)),
        };
      }
      context.manifest.guidelines = documents;
    },
  };
}

function list(items: string[]): string {
  return items.length < 3 ? items.join(" and ") : `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

/**
 * One row per covered brand with its assets side by side. Each asset sits on
 * the brand background inside a band of clear space. Assets measuring whole
 * grid units, such as the symbols, also show their grid.
 */
async function clearSpaceSvg(
  context: ExportContext,
  document: BrandId,
  covered: BrandId[],
  options: GuidelinesOptions["clearSpace"],
): Promise<string> {
  const [area, grid] = await Promise.all([
    context.color(document, options.colors.area, "light"),
    context.color(document, options.colors.grid, "light"),
  ]);
  const stroke = gridUnit / 35;
  const elements: string[] = [];
  let width = 0;
  let y = 0;

  for (const brand of covered) {
    const row = options.kinds.map((kind) => {
      const [asset] = context.select({brands: [brand], kinds: [kind], treatments: [options.treatment]});
      if (!asset) throw new Error(`${brand} has no ${kind} ${options.treatment} asset`);
      return asset;
    });
    let x = 0;
    for (const asset of row) {
      elements.push(await block(context, asset, x, y, area, grid, stroke));
      x += asset.colored.width + 2 * clearSpace + gridUnit;
    }
    width = Math.max(width, x - gridUnit);
    y += Math.max(...row.map((asset) => asset.colored.height)) + 2 * clearSpace + gridUnit;
  }
  const height = y - gridUnit;
  const pixelHeight = Math.round((options.width * height) / width);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${options.width}" height="${pixelHeight}" viewBox="0 0 ${width} ${height}">${elements.join("")}</svg>`;
}

async function block(context: ExportContext, asset: Asset, x: number, y: number, area: string, grid: string, stroke: number) {
  const {width, height, paths} = asset.colored;
  const outerWidth = width + 2 * clearSpace;
  const outerHeight = height + 2 * clearSpace;
  const onGrid = width % gridUnit === 0 && height % gridUnit === 0;
  const lines = (size: number, outer: number) => [
    0,
    ...Array.from({length: onGrid ? size / gridUnit + 1 : 2}, (_, k) => clearSpace + (onGrid ? k * gridUnit : k * size)),
    outer,
  ];
  const vertical = lines(width, outerWidth).map((at) => `<path d="M${x + at} ${y}V${y + outerHeight}"/>`);
  const horizontal = lines(height, outerHeight).map((at) => `<path d="M${x} ${y + at}H${x + outerWidth}"/>`);
  const artwork = paths
    .map(({d, fill, fillRule}) => `<path fill="${fill}"${fillRule ? ` fill-rule="${fillRule}"` : ""} d="${d}"/>`)
    .join("");
  return [
    `<rect x="${x}" y="${y}" width="${outerWidth}" height="${outerHeight}" fill="${area}"/>`,
    `<rect x="${x + clearSpace}" y="${y + clearSpace}" width="${width}" height="${height}" fill="${await context.background(asset.brand, asset.treatment.scheme)}"/>`,
    `<g transform="translate(${x + clearSpace} ${y + clearSpace})">${artwork}</g>`,
    `<g stroke="${grid}" stroke-width="${stroke}" fill="none">${[...vertical, ...horizontal].join("")}</g>`,
  ].join("");
}
