import {readFile} from 'node:fs/promises';
import {basename, resolve} from 'node:path';

import {marked} from 'marked';

import {type BrandId, brands, clearSpace, gridUnit, type LogoKind} from '../../config.js';
import {packageDirectory, pathElements} from '../lib/compose.js';
import {svgToPng} from '../lib/raster.js';
import type {Asset, ExportContext, ExportPlugin, TreatmentId} from './plugin.js';

const guidelinesDirectory = resolve(packageDirectory, 'guidelines');

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

/** An image in the guidelines; `path` is relative to dist/. */
export interface GuidelinesImage {
  path: string;
  alt: string;
  width: number;
}

export interface GuidelinesSection {
  id: string;
  title: string;
  markdown: string;
  html: string;
  /** Images shown after the section's text. */
  images: GuidelinesImage[];
}

/** The guidelines as data, so consumers compose them under their own headings without parsing Markdown. */
export interface GuidelinesData {
  title: string;
  intro: {markdown: string; html: string};
  sections: GuidelinesSection[];
}

/**
 * Brand guidelines per document, from guidelines/template.md and a short
 * description per brand in guidelines/brands/<brand>.md, plus a clear-space
 * illustration drawn from the built artwork. Writes
 * guidelines/<document>/BRAND-GUIDELINES.md and clear-space.png for the press
 * kit, and guidelines/<document>.json with the same content as data.
 */
export function guidelines(options: GuidelinesOptions): ExportPlugin {
  return {
    name: 'guidelines',
    async run(context) {
      const template = await readFile(resolve(guidelinesDirectory, 'template.md'), 'utf8');
      const documents: Record<string, {document: string; data: string; clearSpace: string}> = {};
      for (const [document, covered] of Object.entries(options.documents) as Array<
        [BrandId, BrandId[]]
      >) {
        const names = covered.map((brand) => brands[brand].name);
        const directory = `guidelines/${document}`;
        const image = await clearSpaceSvg(context, document, covered, options.clearSpace);
        const values: Record<string, string> = {
          title: brands[document].name,
          gridUnit: String(gridUnit),
          names: list(names),
          about: (
            await Promise.all(
              covered.map((brand) =>
                readFile(resolve(guidelinesDirectory, 'brands', `${brand}.md`), 'utf8'),
              ),
            )
          )
            .map((text) => text.trim())
            .join('\n\n'),
          writeNames: `Write the ${names.length === 1 ? 'name' : 'names'} as ${list(names.map((name) => `**${name}**`))} in prose.`,
          kitFiles: list(
            context.plugins.flatMap((plugin) => (plugin.kitContents ? [plugin.kitContents] : [])),
          ),
        };
        const clearSpaceImage: GuidelinesImage = {
          path: `${directory}/clear-space.png`,
          alt: `${list(names)} logos with one grid unit of clear space on every side`,
          width: 800,
        };
        const fill = (images: Record<string, string>) =>
          template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
            const value = values[key] ?? images[key];
            if (value === undefined)
              throw new Error(`guidelines/template.md: unknown placeholder {{${key}}}`);
            return value;
          });
        // The press-kit document shows the image beside itself, as HTML so Markdown renderers show it as is.
        const markdown = fill({
          clearSpace: `<img src="${basename(clearSpaceImage.path)}" alt="${clearSpaceImage.alt}" width="${clearSpaceImage.width}">`,
        });
        const data = guidelinesData(fill({clearSpace: imageMarker('clearSpace')}), {
          clearSpace: clearSpaceImage,
        });
        documents[document] = {
          document: await context.write(`${directory}/BRAND-GUIDELINES.md`, markdown),
          data: await context.write(
            `guidelines/${document}.json`,
            `${JSON.stringify(data, null, 2)}\n`,
          ),
          clearSpace: await context.write(clearSpaceImage.path, await svgToPng(image)),
        };
      }
      context.manifest.guidelines = documents;
    },
  };
}

const imageMarker = (key: string) => `<!-- image:${key} -->`;

/**
 * Splits the filled template into its title, intro, and sections. The template is the only Markdown this
 * parses, so its shape is checked strictly: one `#` title, then `##` sections, and image placeholders on
 * their own lines.
 */
export function guidelinesData(
  source: string,
  images: Record<string, GuidelinesImage>,
): GuidelinesData {
  const fail = (problem: string): never => {
    throw new Error(`guidelines/template.md: ${problem}`);
  };
  const [titleLine = '', ...lines] = source.trimEnd().split('\n');
  if (!titleLine.startsWith('# ')) fail('must start with a # title');
  const html = (markdown: string) => marked.parse(markdown, {async: false});

  const blocks: Array<{title?: string; lines: string[]}> = [{lines: []}];
  for (const line of lines) {
    if (line.startsWith('```')) fail('code blocks are not supported');
    if (line.startsWith('## ')) blocks.push({title: line.slice(3).trim(), lines: []});
    else if (line.startsWith('#'))
      fail(`only ## section headings may follow the title, found "${line}"`);
    else blocks.at(-1)!.lines.push(line);
  }
  const [intro, ...sectionBlocks] = blocks;
  const ids = new Set<string>();
  const sections = sectionBlocks.map(({title = '', lines: sectionLines}) => {
    const id = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    if (ids.has(id)) fail(`two sections are titled "${title}"`);
    ids.add(id);
    const sectionImages: GuidelinesImage[] = [];
    const text = sectionLines.filter((line) => {
      const key = /^<!-- image:(\w+) -->$/.exec(line.trim())?.[1];
      if (!key) return true;
      const image = images[key];
      if (!image) fail(`unknown image ${key}`);
      sectionImages.push(image!);
      return false;
    });
    const markdown = text.join('\n').trim();
    if (!markdown) fail(`section "${title}" is empty`);
    return {id, title, markdown, html: html(markdown), images: sectionImages};
  });
  if (sections.length === 0) fail('has no ## sections');
  const introMarkdown = intro!.lines.join('\n').trim();
  if (introMarkdown.includes('<!-- image:')) fail('images must be inside a section');
  return {
    title: titleLine.slice(2).trim(),
    intro: {markdown: introMarkdown, html: html(introMarkdown)},
    sections,
  };
}

function list(items: string[]): string {
  return items.length < 3
    ? items.join(' and ')
    : `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`;
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
  options: GuidelinesOptions['clearSpace'],
): Promise<string> {
  const [area, grid] = await Promise.all([
    context.color(document, options.colors.area, 'light'),
    context.color(document, options.colors.grid, 'light'),
  ]);
  const stroke = gridUnit / 35;
  const elements: string[] = [];
  let width = 0;
  let y = 0;

  for (const brand of covered) {
    const row = options.kinds.map((kind) => {
      const [asset] = context.select({
        brands: [brand],
        kinds: [kind],
        treatments: [options.treatment],
      });
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
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${options.width}" height="${pixelHeight}" viewBox="0 0 ${width} ${height}">${elements.join('')}</svg>`;
}

async function block(
  context: ExportContext,
  asset: Asset,
  x: number,
  y: number,
  area: string,
  grid: string,
  stroke: number,
) {
  const {width, height, paths} = asset.colored;
  const outerWidth = width + 2 * clearSpace;
  const outerHeight = height + 2 * clearSpace;
  const onGrid = width % gridUnit === 0 && height % gridUnit === 0;
  const lines = (size: number, outer: number) => [
    0,
    ...Array.from(
      {length: onGrid ? size / gridUnit + 1 : 2},
      (_, k) => clearSpace + (onGrid ? k * gridUnit : k * size),
    ),
    outer,
  ];
  const vertical = lines(width, outerWidth).map(
    (at) => `<path d="M${x + at} ${y}V${y + outerHeight}"/>`,
  );
  const horizontal = lines(height, outerHeight).map(
    (at) => `<path d="M${x} ${y + at}H${x + outerWidth}"/>`,
  );
  return [
    `<rect x="${x}" y="${y}" width="${outerWidth}" height="${outerHeight}" fill="${area}"/>`,
    `<rect x="${x + clearSpace}" y="${y + clearSpace}" width="${width}" height="${height}" fill="${await context.background(asset.brand, asset.treatment.scheme)}"/>`,
    `<g transform="translate(${x + clearSpace} ${y + clearSpace})">${pathElements(paths)}</g>`,
    `<g stroke="${grid}" stroke-width="${stroke}" fill="none">${[...vertical, ...horizontal].join('')}</g>`,
  ].join('');
}
