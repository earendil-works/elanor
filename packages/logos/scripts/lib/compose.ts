import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';

import {
  backgroundToken,
  type BrandConfig,
  type BrandId,
  brands,
  type LockupName,
  type LockupRule,
  lockups,
  type LogoKind,
  logoTokens,
  type PartName,
  parts,
  type Treatment,
  treatments,
} from '../../config.js';
import {translatePath} from './path-data.js';
import {parseSource, type SourceArtwork, type SourcePath} from './svg.js';

export const packageDirectory = resolve(import.meta.dirname, '../..');
export const sourceDirectory = resolve(packageDirectory, 'sources');

const lockupKindPrefix = 'logo-wordmark-';

/** Every asset kind: the symbol alone, then one per lockup rule. */
export const kinds: LogoKind[] = [
  'logo',
  ...(Object.keys(lockups) as LockupName[]).map(
    (lockup): LogoKind => `${lockupKindPrefix}${lockup}`,
  ),
];

/** A brand's color treatments; a painting has no one-color version. */
export function brandTreatments(brand: BrandId): readonly Treatment[] {
  const brandConfig: BrandConfig = brands[brand];
  return brandConfig.painting ? treatments.filter(({monochrome}) => !monochrome) : treatments;
}

/** The lockup a kind composes, or undefined for the symbol alone. */
export function lockupOf(kind: LogoKind): LockupName | undefined {
  return kind === 'logo' ? undefined : (kind.slice(lockupKindPrefix.length) as LockupName);
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
  fillRule?: 'evenodd';
  /** CSS class, for example to target the path in color-scheme rules. */
  className?: string;
}

/** SVG `<path>` elements for colored paths. */
export function pathElements(paths: ColoredPath[]): string {
  return paths
    .map(
      ({d, fill, fillRule, className}) =>
        `<path${className ? ` class="${className}"` : ''} fill="${fill}"${fillRule ? ` fill-rule="${fillRule}"` : ''} d="${d}"/>`,
    )
    .join('');
}

export interface ColoredArtwork {
  width: number;
  height: number;
  paths: ColoredPath[];
}

/** Loads a source drawing, falling back as configured when an optional part is absent. */
export async function loadPart(brand: BrandId, part: PartName): Promise<SourceArtwork | undefined> {
  const file = resolve(sourceDirectory, brand, `${part}.svg`);
  const source = await readFile(file, 'utf8').catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT') return undefined;
    throw error;
  });
  if (source !== undefined) return parseSource(source, `${brand}/${part}.svg`);
  const rule = parts[part];
  return 'fallback' in rule ? loadPart(brand, rule.fallback) : undefined;
}

async function requirePart(brand: BrandId, part: PartName): Promise<SourceArtwork> {
  const artwork = await loadPart(brand, part);
  if (!artwork) throw new Error(`${brand}: missing sources/${brand}/${part}.svg`);
  return artwork;
}

/** Places parts like Figma auto layout: sequential on the main axis, centered on the cross axis. */
/** The shared lockup rule with the brand's overrides applied. */
function lockupRule(brand: BrandId, lockup: LockupName): LockupRule {
  const brandConfig: BrandConfig = brands[brand];
  return {...lockups[lockup], ...brandConfig.lockups?.[lockup]};
}

export function composeLockup(
  mark: SourceArtwork,
  wordmark: SourceArtwork,
  brand: BrandId,
  lockup: LockupName,
): Artwork {
  const rule = lockupRule(brand, lockup);
  const row = rule.direction === 'row';
  const width = row ? mark.width + rule.gap + wordmark.width : Math.max(mark.width, wordmark.width);
  const innerHeight = row
    ? Math.max(mark.height, wordmark.height)
    : mark.height + rule.gap + wordmark.height;
  const height = innerHeight + 2 * rule.paddingBlock;

  const place = (part: SourceArtwork, main: number): SourcePath[] => {
    const x = row ? main : (width - part.width) / 2;
    const y = row ? rule.paddingBlock + (innerHeight - part.height) / 2 : rule.paddingBlock + main;
    return part.paths.map((path) => ({...path, d: translatePath(path.d, x, y)}));
  };

  return {
    width,
    height,
    paths: [
      ...place(mark, 0),
      ...place(wordmark, row ? mark.width + rule.gap : mark.height + rule.gap),
    ],
  };
}

export async function composeArtwork(
  brand: BrandId,
  kind: LogoKind,
  monochrome: boolean,
): Promise<Artwork> {
  const mark = await requirePart(brand, monochrome ? 'mark-monochrome' : 'mark');
  const lockup = lockupOf(kind);
  if (!lockup) return mark;
  return composeLockup(
    mark,
    await requirePart(brand, lockupRule(brand, lockup).wordmark),
    brand,
    lockup,
  );
}

type Scheme = 'light' | 'dark';

/** A token's value in one modifier context of the design-tokens catalogue. */
interface CatalogValue {
  value: unknown;
  aliasOf?: string;
}

/** Design tokens by path, read from the design-tokens catalogue. */
export interface TokenCatalog {
  tokens: Record<
    string,
    CatalogValue & {
      /** Values that differ from the default color scheme, e.g. `contexts.colorScheme.dark`. */
      contexts?: Record<string, Record<string, CatalogValue>>;
      extensions?: Record<string, unknown>;
    }
  >;
}

/** A token's value in a color scheme; the catalogue lists only values that differ from the default. */
export function tokenInScheme(
  tokens: TokenCatalog,
  token: string,
  scheme: Scheme,
): CatalogValue | undefined {
  const entry = tokens.tokens[token];
  return entry?.contexts?.colorScheme?.[scheme] ?? entry;
}

const catalogs = new Map<BrandId, Promise<TokenCatalog>>();

/** A brand's token catalogue; each brand's logos take their colors from its own token build. */
export function loadTokens(brand: BrandId): Promise<TokenCatalog> {
  if (!catalogs.has(brand)) {
    const file = createRequire(import.meta.url).resolve(
      `@earendil-works/design-tokens/${brand}.catalog.json`,
    );
    catalogs.set(
      brand,
      readFile(file, 'utf8').then((text) => {
        const catalog = JSON.parse(text) as {
          tokens: Array<{path: string} & TokenCatalog['tokens'][string]>;
        };
        return {tokens: Object.fromEntries(catalog.tokens.map((token) => [token.path, token]))};
      }),
    );
  }
  return catalogs.get(brand)!;
}

/** The brand's own page background for a color scheme. */
export async function brandBackground(brand: BrandId, scheme: Scheme): Promise<string> {
  return tokenHex(await loadTokens(brand), backgroundToken, scheme);
}

export function tokenHex(tokens: TokenCatalog, token: string, scheme: Scheme): string {
  const hex = (tokenInScheme(tokens, token, scheme)?.value as {hex?: string} | undefined)?.hex;
  if (!hex)
    throw new Error(
      `Token ${token} has no ${scheme} hex value; build @earendil-works/design-tokens first`,
    );
  return hex;
}

/** Replaces token links with the treatment's colors; fixed colors stay. Monochrome paints every shape with one color. */
export function colorArtwork(
  artwork: Artwork,
  treatment: Treatment,
  tokens: TokenCatalog,
): ColoredArtwork {
  return {
    width: artwork.width,
    height: artwork.height,
    paths: artwork.paths.map(({token, color, d, fillRule}) => ({
      d,
      fill: treatment.monochrome
        ? tokenHex(tokens, logoTokens.monochrome, treatment.scheme)
        : (color ?? tokenHex(tokens, token, treatment.scheme)),
      ...(fillRule ? {fillRule} : {}),
    })),
  };
}

export function serializeSvg(artwork: ColoredArtwork): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${artwork.width}" height="${artwork.height}" viewBox="0 0 ${artwork.width} ${artwork.height}">${pathElements(artwork.paths)}</svg>\n`;
}
