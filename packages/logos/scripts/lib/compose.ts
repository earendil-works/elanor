import {readFile} from "node:fs/promises";
import {createRequire} from "node:module";
import {resolve} from "node:path";
import {
  type BrandId,
  brands,
  type LockupName,
  lockups,
  type LogoKind,
  logoTokens,
  type PartName,
  parts,
  tokenBrand,
  type Treatment,
} from "../../config.js";
import {translatePath} from "./path-data.js";
import {parseSource, type SourceArtwork, type SourcePath} from "./svg.js";

export const packageDirectory = resolve(import.meta.dirname, "../..");
export const sourceDirectory = resolve(packageDirectory, "sources");

const lockupKindPrefix = "logo-wordmark-";

/** Every asset kind: the symbol alone, then one per lockup rule. */
export const kinds: LogoKind[] = [
  "logo",
  ...(Object.keys(lockups) as LockupName[]).map((lockup): LogoKind => `${lockupKindPrefix}${lockup}`),
];

/** The lockup a kind composes, or undefined for the symbol alone. */
export function lockupOf(kind: LogoKind): LockupName | undefined {
  return kind === "logo" ? undefined : (kind.slice(lockupKindPrefix.length) as LockupName);
}

/** Artwork with fills still linked to tokens; the input for every output format. */
export interface Artwork {
  width: number;
  height: number;
  paths: SourcePath[];
}

export interface ColoredPath {
  d: string;
  fill: string;
  fillRule?: "evenodd";
}

export interface ColoredArtwork {
  width: number;
  height: number;
  paths: ColoredPath[];
}

/** Loads a source drawing, falling back as configured when an optional part is absent. */
export async function loadPart(brand: BrandId, part: PartName): Promise<SourceArtwork | undefined> {
  const file = resolve(sourceDirectory, brand, `${part}.svg`);
  const source = await readFile(file, "utf8").catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return undefined;
    throw error;
  });
  if (source !== undefined) return parseSource(source, `${brand}/${part}.svg`);
  const rule = parts[part];
  return "fallback" in rule ? loadPart(brand, rule.fallback) : undefined;
}

async function requirePart(brand: BrandId, part: PartName): Promise<SourceArtwork> {
  const artwork = await loadPart(brand, part);
  if (!artwork) throw new Error(`${brand}: missing sources/${brand}/${part}.svg`);
  return artwork;
}

/** Places parts like Figma auto layout: sequential on the main axis, centered on the cross axis. */
export function composeLockup(mark: SourceArtwork, wordmark: SourceArtwork, brand: BrandId, lockup: LockupName): Artwork {
  const rule = {...lockups[lockup], ...(brands[brand] as {lockups?: Record<string, object>}).lockups?.[lockup]};
  const row = rule.direction === "row";
  const width = row ? mark.width + rule.gap + wordmark.width : Math.max(mark.width, wordmark.width);
  const innerHeight = row ? Math.max(mark.height, wordmark.height) : mark.height + rule.gap + wordmark.height;
  const height = innerHeight + 2 * rule.paddingBlock;

  const place = (part: SourceArtwork, main: number): SourcePath[] => {
    const x = row ? main : (width - part.width) / 2;
    const y = row ? rule.paddingBlock + (innerHeight - part.height) / 2 : rule.paddingBlock + main;
    return part.paths.map((path) => ({...path, d: translatePath(path.d, x, y)}));
  };

  return {
    width,
    height,
    paths: [...place(mark, 0), ...place(wordmark, row ? mark.width + rule.gap : mark.height + rule.gap)],
  };
}

export async function composeArtwork(brand: BrandId, kind: LogoKind, monochrome: boolean): Promise<Artwork> {
  const mark = await requirePart(brand, monochrome ? "mark-monochrome" : "mark");
  const lockup = lockupOf(kind);
  if (!lockup) return mark;
  return composeLockup(mark, await requirePart(brand, lockups[lockup].wordmark), brand, lockup);
}

type Scheme = "light" | "dark";

/** Design tokens by path, read from the design-tokens catalogue. */
export interface TokenCatalog {
  tokens: Record<string, {values: Record<Scheme, unknown>; aliasOf?: Record<Scheme, string | null>; extensions?: Record<string, unknown>}>;
}

export async function loadTokens(): Promise<TokenCatalog> {
  const require = createRequire(import.meta.url);
  const file = require.resolve(`@earendil-works/design-tokens/${tokenBrand}.catalog.json`);
  const catalog = JSON.parse(await readFile(file, "utf8")) as {tokens: Array<{path: string} & TokenCatalog["tokens"][string]>};
  return {tokens: Object.fromEntries(catalog.tokens.map((token) => [token.path, token]))};
}

export function tokenHex(tokens: TokenCatalog, token: string, scheme: Scheme): string {
  const hex = (tokens.tokens[token]?.values[scheme] as {hex?: string} | undefined)?.hex;
  if (!hex) throw new Error(`Token ${token} has no ${scheme} hex value; build @earendil-works/design-tokens first`);
  return hex;
}

/** Replaces token links with the treatment's colors. Monochrome paints every shape with one color. */
export function colorArtwork(artwork: Artwork, treatment: Treatment, tokens: TokenCatalog): ColoredArtwork {
  return {
    width: artwork.width,
    height: artwork.height,
    paths: artwork.paths.map(({token, d, fillRule}) => ({
      d,
      fill: tokenHex(tokens, treatment.monochrome ? logoTokens.monochrome : token, treatment.scheme),
      ...(fillRule ? {fillRule} : {}),
    })),
  };
}

export function serializeSvg(artwork: ColoredArtwork): string {
  const paths = artwork.paths
    .map(({d, fill, fillRule}) => `<path fill="${fill}"${fillRule ? ` fill-rule="${fillRule}"` : ""} d="${d}"/>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${artwork.width}" height="${artwork.height}" viewBox="0 0 ${artwork.width} ${artwork.height}">${paths}</svg>\n`;
}
