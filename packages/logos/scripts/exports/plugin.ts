import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';

import {type BrandId, brands, type LogoKind, type Treatment, treatments} from '../../config.js';
import {
  type Artwork,
  brandBackground,
  type ColoredArtwork,
  colorArtwork,
  composeArtwork,
  kinds,
  loadTokens,
  type TokenCatalog,
  tokenHex,
} from '../lib/compose.js';

/**
 * An export plugin produces one kind of output from the built logos, such as
 * favicons or print PDFs. Plugins are listed with their options in
 * exports.config.ts and run in that order, so later plugins can use files
 * earlier ones wrote.
 */
export interface ExportPlugin {
  name: string;
  /** What the plugin adds to each brand's press kit folder (`kits/<brand>/`), as a phrase for the guidelines' file list. */
  kitContents?: string;
  run(context: ExportContext): Promise<void>;
}

export type TreatmentId = Treatment['id'];

/** Picks assets by brand, kind, and color treatment; omit a field to select all of them. */
export interface AssetSelector {
  brands?: BrandId[];
  kinds?: LogoKind[];
  treatments?: TreatmentId[];
}

export interface Asset {
  id: string;
  brand: BrandId;
  kind: LogoKind;
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

export interface Manifest {
  brands: ManifestBrand[];
  [key: string]: unknown;
}

export interface ExportContext {
  /** Every configured plugin, in run order. */
  plugins: ExportPlugin[];
  /** Assets of every brand, kind, and treatment, composed and colored with the brand's tokens; omit the selector for all of them. */
  select(selector?: AssetSelector): Asset[];
  /** The symbol alone for a brand and treatment. */
  mark(brand: BrandId, treatment: TreatmentId): Asset;
  tokens(brand: BrandId): Promise<TokenCatalog>;
  /** A token's color in a brand's build. */
  color(brand: BrandId, token: string, scheme: 'light' | 'dark'): Promise<string>;
  /** The brand's own page background. */
  background(brand: BrandId, scheme: 'light' | 'dark'): Promise<string>;
  /** manifest.json, written after every plugin has run. */
  manifest: Manifest;
  brandManifest(brand: BrandId): ManifestBrand;
  assetManifest(asset: Asset): ManifestAsset;
  /** The output directory, where write() puts files and later plugins can read them. */
  distDirectory: string;
  /** Writes a file relative to the output directory and returns that relative path. */
  write(path: string, data: string | Buffer): Promise<string>;
}

export async function createExportContext(
  distDirectory: string,
  manifest: Manifest,
  plugins: ExportPlugin[],
): Promise<ExportContext> {
  const assets: Asset[] = [];
  for (const brand of Object.keys(brands) as BrandId[]) {
    const tokens = await loadTokens(brand);
    for (const kind of kinds) {
      for (const treatment of treatments) {
        const source = await composeArtwork(brand, kind, treatment.monochrome);
        assets.push({
          id: `${brand}-${kind}-${treatment.id}`,
          brand,
          kind,
          treatment,
          source,
          colored: colorArtwork(source, treatment, tokens),
        });
      }
    }
  }

  const select = (selector: AssetSelector = {}) =>
    assets.filter(
      (asset) =>
        (!selector.brands || selector.brands.includes(asset.brand)) &&
        (!selector.kinds || selector.kinds.includes(asset.kind)) &&
        (!selector.treatments || selector.treatments.includes(asset.treatment.id)),
    );
  const color = async (brand: BrandId, token: string, scheme: 'light' | 'dark') =>
    tokenHex(await loadTokens(brand), token, scheme);
  const brandManifest = (brand: BrandId) => {
    const entry = manifest.brands.find(({id}) => id === brand);
    if (!entry) throw new Error(`Manifest has no brand ${brand}`);
    return entry;
  };

  return {
    plugins,
    select,
    mark(brand, treatment) {
      const [asset] = select({brands: [brand], kinds: ['logo'], treatments: [treatment]});
      if (!asset) throw new Error(`${brand} has no ${treatment} mark`);
      return asset;
    },
    tokens: loadTokens,
    color,
    background: brandBackground,
    manifest,
    brandManifest,
    assetManifest(asset) {
      const entry = brandManifest(asset.brand).assets.find(({id}) => id === asset.id);
      if (!entry) throw new Error(`Manifest has no asset ${asset.id}`);
      return entry;
    },
    distDirectory,
    async write(path, data) {
      const file = resolve(distDirectory, path);
      await mkdir(dirname(file), {recursive: true});
      await writeFile(file, data);
      return path;
    },
  };
}
