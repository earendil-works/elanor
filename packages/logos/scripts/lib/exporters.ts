import {readdir, readFile} from "node:fs/promises";
import {relative, resolve} from "node:path";
import {type BrandId, brands, gridUnit, type Treatment} from "../../config.js";
import type {ExportDefinition, Kind} from "../../exports.config.js";
import {type Artwork, type ColoredArtwork, loadTokens, monochromeToken, packageDirectory, serializeSvg, type TokenCatalog, tokenHex} from "./compose.js";
import {createIco, createZip} from "./containers.js";
import {createPdf} from "./pdf.js";
import {circleSafeFrame, frameSvg, renderPng, squareFrame, tightFrame} from "./raster.js";

export interface Asset {
  id: string;
  brand: BrandId;
  kind: Kind;
  treatment: Treatment;
  /** Token-linked artwork (already the monochrome drawing for monochrome treatments). */
  source: Artwork;
  colored: ColoredArtwork;
}

export interface ManifestAsset {
  id: string;
  files: Record<string, unknown>;
}

export interface ManifestBrand {
  id: BrandId;
  name: string;
  assets: ManifestAsset[];
  [key: string]: unknown;
}

export interface ExportContext {
  assets: Asset[];
  tokens: TokenCatalog;
  manifest: {brands: ManifestBrand[]; [key: string]: unknown};
  /** Writes a file relative to dist/ and returns that relative path. */
  write(path: string, data: string | Buffer): Promise<string>;
}

type Exporter<T extends ExportDefinition["type"]> = (
  definition: Extract<ExportDefinition, {type: T}>,
  context: ExportContext,
) => Promise<void>;

const kitPath = (asset: Asset, extension: string) =>
  `kits/${asset.brand}/${asset.kind}/${asset.treatment.id}/${asset.id}.${extension}`;

function select(context: ExportContext, selector: Extract<ExportDefinition, {select?: unknown}>["select"] = {}): Asset[] {
  return context.assets.filter(
    (asset) =>
      (!selector.brands || selector.brands.includes(asset.brand)) &&
      (!selector.kinds || selector.kinds.includes(asset.kind)) &&
      (!selector.treatments || selector.treatments.includes(asset.treatment.id)),
  );
}

function manifestBrand(context: ExportContext, brand: BrandId): ManifestBrand {
  const entry = context.manifest.brands.find(({id}) => id === brand);
  if (!entry) throw new Error(`Manifest has no brand ${brand}`);
  return entry;
}

function manifestAsset(context: ExportContext, asset: Asset): ManifestAsset {
  const entry = manifestBrand(context, asset.brand).assets.find(({id}) => id === asset.id);
  if (!entry) throw new Error(`Manifest has no asset ${asset.id}`);
  return entry;
}

/** The brand's own page background, used behind icons and avatars. */
async function canvas(brand: BrandId, scheme: "light" | "dark"): Promise<string> {
  return tokenHex(await loadTokens(brand), "semantic.color.background.canvas", scheme);
}

function markAsset(context: ExportContext, brand: BrandId, treatment: string): Asset {
  const asset = context.assets.find((candidate) => candidate.brand === brand && candidate.kind === "logo" && candidate.treatment.id === treatment);
  if (!asset) throw new Error(`${brand} has no ${treatment} mark`);
  return asset;
}

const logoFiles: Exporter<"logo-files"> = async (definition, context) => {
  for (const asset of select(context, definition.select)) {
    const files = manifestAsset(context, asset).files;
    if (definition.formats.includes("svg")) files.kitSvg = await context.write(kitPath(asset, "svg"), serializeSvg(asset.colored));
    if (definition.formats.includes("png")) {
      const {width, height} = asset.colored;
      const scale = Math.min(definition.png.scale, definition.png.maxDimension / Math.max(width, height));
      const png = await renderPng(asset.colored, tightFrame(asset.colored, Math.round(width * scale), Math.round(height * scale)));
      files.png = await context.write(kitPath(asset, "png"), png);
    }
  }
};

const pngHeights: Exporter<"png-heights"> = async (definition, context) => {
  for (const asset of select(context, definition.select)) {
    const entries = [];
    for (const height of definition.heights) {
      const width = Math.round((height * asset.colored.width) / asset.colored.height);
      const png = await renderPng(asset.colored, tightFrame(asset.colored, width, height));
      entries.push({height, path: await context.write(`kits/${asset.brand}/${definition.name}/${asset.id}-${height}px.png`, png)});
    }
    manifestAsset(context, asset).files[definition.name] = entries;
  }
};

const outputConditions: Record<string, string> = {psoCoatedV3: "FOGRA51", psoUncoatedV3: "FOGRA52"};

const print: Exporter<"print"> = async (definition, context) => {
  for (const asset of select(context, definition.select)) {
    const pdfs: Record<string, string> = {};
    for (const profile of definition.profiles) {
      const paths = asset.source.paths.map(({d, token, fillRule}) => {
        const linked = asset.treatment.monochrome ? monochromeToken : token;
        const primitive = context.tokens.tokens[linked]?.aliasOf?.[asset.treatment.scheme];
        const print = primitive ? context.tokens.tokens[primitive]?.extensions?.["com.earendil-works.print"] : undefined;
        const cmyk = (print as {cmyk?: Record<string, [number, number, number, number]>} | undefined)?.cmyk?.[profile];
        if (!cmyk) throw new Error(`${linked} (${asset.treatment.scheme}) has no ${profile} CMYK build`);
        return {d, cmyk, ...(fillRule ? {fillRule} : {})};
      });
      const pdf = createPdf(
        {width: asset.source.width, height: asset.source.height, paths},
        {millimetersPerUnit: definition.millimetersPerUnit, title: asset.id, outputCondition: outputConditions[profile] ?? profile},
      );
      pdfs[profile] = await context.write(`kits/${asset.brand}/print/${profile}/${asset.id}.pdf`, pdf);
    }
    manifestAsset(context, asset).files.pdf = pdfs;
  }
};

const favicons: Exporter<"favicons"> = async (definition, context) => {
  for (const brand of Object.keys(brands) as BrandId[]) {
    const light = markAsset(context, brand, "on-light").colored;
    const dark = markAsset(context, brand, "on-dark").colored;
    const directory = `kits/${brand}/favicons`;
    const files: Record<string, string> = {};
    const background = await canvas(brand, "light");

    // The SVG favicon switches to the dark colors with the browser's color scheme.
    const svgFrame = squareFrame(light, 32, 0);
    const changed = light.paths.map((path, index) => path.fill !== dark.paths[index]!.fill);
    const rules = [...new Set(dark.paths.filter((_, index) => changed[index]).map(({fill}) => fill))]
      .map((fill) => `.${classFor(fill)}{fill:${fill}}`)
      .join("");
    const svg = frameSvg(light, svgFrame).replace(/<path /g, (match, offset: number, text: string) => {
      const index = text.slice(0, offset).split("<path ").length - 1;
      return changed[index] ? `<path class="${classFor(dark.paths[index]!.fill)}" ` : match;
    });
    files.svg = await context.write(
      `${directory}/favicon.svg`,
      rules ? svg.replace(/>/, `><style>@media (prefers-color-scheme:dark){${rules}}</style>`) : svg,
    );

    const icoImages = [];
    for (const size of definition.icoSizes) icoImages.push({size, png: await renderPng(light, squareFrame(light, size, 0))});
    files.ico = await context.write(`${directory}/favicon.ico`, createIco(icoImages));
    files.appleTouchIcon = await context.write(
      `${directory}/apple-touch-icon.png`,
      await renderPng(light, squareFrame(light, definition.appleTouchSize, gridUnit, background)),
    );
    const icons = [];
    for (const size of definition.iconSizes) {
      const path = await context.write(`${directory}/icon-${size}.png`, await renderPng(light, squareFrame(light, size, gridUnit)));
      icons.push({src: `icon-${size}.png`, sizes: `${size}x${size}`, type: "image/png"});
      files[`icon${size}`] = path;
    }
    files.maskable = await context.write(
      `${directory}/icon-maskable-${definition.maskableSize}.png`,
      await renderPng(light, circleSafeFrame(light, definition.maskableSize, 0.8, background)),
    );
    icons.push({src: `icon-maskable-${definition.maskableSize}.png`, sizes: `${definition.maskableSize}x${definition.maskableSize}`, type: "image/png", purpose: "maskable"});

    const name = brands[brand].name;
    files.webmanifest = await context.write(
      `${directory}/site.webmanifest`,
      `${JSON.stringify({name, short_name: name, icons, theme_color: background, background_color: background, display: "standalone"}, null, 2)}\n`,
    );
    files.html = await context.write(
      `${directory}/head.html`,
      [
        '<link rel="icon" href="/favicon.ico" sizes="32x32">',
        '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
        '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
        '<link rel="manifest" href="/site.webmanifest">',
        "",
      ].join("\n"),
    );
    manifestBrand(context, brand).favicons = files;
  }
};

function classFor(fill: string): string {
  return `c${fill.slice(1)}`;
}

const avatars: Exporter<"avatars"> = async (definition, context) => {
  for (const brand of Object.keys(brands) as BrandId[]) {
    const entries = [];
    for (const treatment of definition.treatments) {
      const mark = markAsset(context, brand, treatment);
      const background = await canvas(brand, mark.treatment.scheme);
      for (const size of definition.sizes) {
        const png = await renderPng(mark.colored, circleSafeFrame(mark.colored, size, 0.8, background));
        entries.push({treatment, size, path: await context.write(`kits/${brand}/social/${brand}-avatar-${treatment}-${size}.png`, png)});
      }
    }
    manifestBrand(context, brand).avatars = entries;
  }
};

const guidelinesDirectory = resolve(packageDirectory, "guidelines");

const pressKits: Exporter<"press-kits"> = async (definition, context) => {
  const kitsDirectory = resolve(packageDirectory, "dist/kits");
  const guidelines = await Promise.all(
    (await readdir(guidelinesDirectory)).sort().map(async (name) => ({name, data: await readFile(resolve(guidelinesDirectory, name))})),
  );
  const kits: Record<string, string> = {};
  for (const [kit, kitBrands] of Object.entries(definition.kits)) {
    const root = `${kit}-press-kit`;
    const files = guidelines.map(({name, data}) => ({path: `${root}/${name}`, data}));
    for (const brand of kitBrands) {
      for (const file of await listFiles(resolve(kitsDirectory, brand))) {
        files.push({path: `${root}/${brand}/${relative(resolve(kitsDirectory, brand), file)}`, data: await readFile(file)});
      }
    }
    kits[kit] = await context.write(`press-kits/${root}.zip`, createZip(files));
  }
  context.manifest.pressKits = kits;
};

async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, {withFileTypes: true});
  const nested = await Promise.all(
    entries.map((entry) => (entry.isDirectory() ? listFiles(resolve(directory, entry.name)) : [resolve(directory, entry.name)])),
  );
  return nested.flat().sort();
}

export const exporters: {[T in ExportDefinition["type"]]: Exporter<T>} = {
  "logo-files": logoFiles,
  "png-heights": pngHeights,
  print,
  favicons,
  avatars,
  "press-kits": pressKits,
};
