import {readdir, readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {dirname, relative, resolve} from 'node:path';
import {iconComponentNames} from '../../plugins/icon-imports.ts';
import {type IconEntry, iconsDist, iconsReactBarrel, type LogoBrand, type LogoManifest, logosDist, logosGuidelines} from './packages.ts';

/*
 * The design API is static: every resource is a prebuilt file. Each area has a small index that lists
 * what exists, and one file per thing it lists, so an agent can find and fetch only what it needs.
 */

const require = createRequire(resolve(process.cwd(), 'package.json'));
const tokensDist = resolve(dirname(require.resolve('@earendil-works/design-tokens/radius.css')), '..');

type Scheme = 'light' | 'dark';

// Tokens

interface CatalogueFile {
  tokens: Array<{
    path: string;
    cssVariable: string;
    type: string;
    description: string;
    modes: Record<Scheme, string>;
    values: Record<Scheme, unknown>;
    aliasOf?: Record<Scheme, string | null>;
    extensions?: Record<string, unknown>;
    sourceToken?: string;
  }>;
}

export interface ApiToken {
  path: string;
  type: string;
  description: string;
  cssVariable: string;
  /** Per color scheme: the resolved DTCG value, its CSS, and a hex value for colors. */
  light: {value: unknown; css: string; hex?: string};
  dark: {value: unknown; css: string; hex?: string};
  aliasOf?: Record<Scheme, string | null>;
  extensions?: Record<string, unknown>;
  url: string;
}

export interface ApiTokenGroup {
  path: string;
  url: string;
  tokens: ApiToken[];
}

const tokenUrl = (brand: string, path: string) => `/api/tokens/${brand}/tokens/${path}.json`;
const groupUrl = (brand: string, path: string) => `/api/tokens/${brand}/groups/${path}.json`;

/** The brands the design-tokens package builds, from its catalogues. */
export async function tokenBrands(): Promise<string[]> {
  const entries = await readdir(tokensDist, {withFileTypes: true});
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
}

export async function loadTokens(brand: string): Promise<ApiToken[]> {
  const catalogue = JSON.parse(await readFile(resolve(tokensDist, brand, 'tokens.catalog.json'), 'utf8')) as CatalogueFile;
  // Composite subproperties (e.g. a typography token's font size) are part of their token's value.
  return catalogue.tokens
    .filter((token) => !token.sourceToken)
    .map((token) => {
      const mode = (scheme: Scheme) => {
        const value = token.values[scheme];
        const hex = token.type === 'color' ? (value as {hex?: string}).hex : undefined;
        return {value, css: token.modes[scheme], ...(hex ? {hex} : {})};
      };
      return {
        path: token.path,
        type: token.type,
        description: token.description,
        cssVariable: token.cssVariable,
        light: mode('light'),
        dark: mode('dark'),
        ...(token.aliasOf ? {aliasOf: token.aliasOf} : {}),
        ...(token.extensions ? {extensions: token.extensions} : {}),
        url: tokenUrl(brand, token.path),
      };
    })
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

/**
 * Tokens grouped by category: the first three path segments (`semantic.color.text`), or the first two where
 * three would leave a single token (`primitive.dimension` for `primitive.dimension.100`).
 */
export async function loadTokenGroups(brand: string): Promise<ApiTokenGroup[]> {
  const tokens = await loadTokens(brand);
  const prefix = (path: string, depth: number) => path.split('.').slice(0, depth).join('.');
  const counts = new Map<string, number>();
  for (const token of tokens) counts.set(prefix(token.path, 3), (counts.get(prefix(token.path, 3)) ?? 0) + 1);
  const groups = new Map<string, ApiToken[]>();
  for (const token of tokens) {
    const category = prefix(token.path, 3);
    const group = counts.get(category)! > 1 ? category : prefix(token.path, 2);
    groups.set(group, [...(groups.get(group) ?? []), token]);
  }
  return [...groups].map(([path, members]) => ({path, url: groupUrl(brand, path), tokens: members}));
}

/** A brand's token index: every group with its token names, and descriptions for semantic tokens. */
export async function tokenIndex(brand: string) {
  return {
    brand,
    colorSchemes: ['light', 'dark'],
    groupUrl: groupUrl(brand, '{group}'),
    tokenUrl: tokenUrl(brand, '{path}'),
    groups: (await loadTokenGroups(brand)).map((group) => ({
      path: group.path,
      url: group.url,
      tokens: group.tokens.map((token) => {
        const name = token.path === group.path ? '$root' : token.path.slice(group.path.length + 1);
        // Semantic descriptions say when to use a token; primitives are the palette they alias.
        return token.path.startsWith('semantic.') && token.description ? {name, description: token.description} : name;
      }),
    })),
  };
}

// Icons

export interface ApiIcon extends IconEntry {
  name: string;
  component: string;
  svg: string;
  react: string;
  url: string;
}

const iconUrl = (name: string) => `/api/icons/${name}.json`;
const keywordUrl = (keyword: string) => `/api/icons/keywords/${keyword}.json`;
/** Words that match most icons without narrowing a search. */
const keywordStopWords = new Set(['an', 'and', 'as', 'at', 'by', 'for', 'in', 'is', 'of', 'on', 'or', 'the', 'to', 'with']);

export async function loadIcons(): Promise<ApiIcon[]> {
  const metadata = JSON.parse(await readFile(resolve(iconsDist, 'metadata.json'), 'utf8')) as Record<string, IconEntry>;
  const names = (await readdir(resolve(iconsDist, 'svg'))).filter((file) => file.endsWith('.svg')).map((file) => file.slice(0, -4));
  const components = iconComponentNames(iconsReactBarrel);
  return names.sort().map((name) => {
    const entry = metadata[name];
    if (!entry) throw new Error(`Missing search tags for ${name}`);
    const component = components.get(name);
    if (!component) throw new Error(`${name} has no React component; build @earendil-works/elanor-icons-react first`);
    return {
      name,
      component,
      tags: entry.tags,
      svg: `/api/icons/${name}.svg`,
      react: `import {${component}} from '@earendil-works/elanor-icons-react/${name}';`,
      url: iconUrl(name),
    };
  });
}

/** Icon names by keyword: every word of each icon's name and tags. */
export async function iconKeywords(): Promise<Map<string, string[]>> {
  const keywords = new Map<string, string[]>();
  for (const icon of await loadIcons()) {
    const words = new Set([icon.name, ...icon.tags].flatMap((text) => text.toLowerCase().match(/[a-z0-9]+/g) ?? []));
    for (const word of words) {
      if (word.length < 2 || keywordStopWords.has(word)) continue;
      keywords.set(word, [...(keywords.get(word) ?? []), icon.name]);
    }
  }
  return keywords;
}

export async function iconIndex() {
  const icons = await loadIcons();
  return {
    count: icons.length,
    iconUrl: iconUrl('{name}'),
    svgUrl: '/api/icons/{name}.svg',
    keywordUrl: keywordUrl('{keyword}'),
    names: icons.map((icon) => icon.name),
  };
}

// Logos

const logoFileUrl = (path: string) => `/api/logos/files/${path}`;
const logoBrandUrl = (brand: string) => `/api/logos/brands/${brand}.json`;

/** The logo manifest with every file path turned into its URL. */
export async function loadLogos(): Promise<LogoManifest> {
  const manifest = JSON.parse(await readFile(resolve(logosDist, 'manifest.json'), 'utf8')) as LogoManifest;
  const urls = (value: unknown, key?: string): unknown => {
    if (typeof value === 'string') return key === 'id' || !/\.[a-z]+$/.test(value) ? value : logoFileUrl(value);
    if (Array.isArray(value)) return value.map((item) => urls(item));
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([name, item]) => [name, urls(item, name)]));
    }
    return value;
  };
  // The press-kit copies of each SVG are the same file; the API lists one.
  for (const brand of manifest.brands) for (const asset of brand.assets) delete asset.files.kitSvg;
  return urls(manifest) as LogoManifest;
}

/** The logo index: usage rules and each brand with its backgrounds. */
export async function logoIndex() {
  const manifest = await loadLogos();
  return {
    rules: {
      gridUnit: `One grid unit is a quarter of the symbol frame width, ${manifest.gridUnit} logo source units.`,
      clearSpace: `Leave at least one grid unit around the whole asset. At a rendered height h, one grid unit is h × ${manifest.gridUnit} / asset height pixels.`,
      treatments: 'Use on-light on light backgrounds and on-dark on dark ones; monochrome only when one color is required. Never recolor.',
      guidelines: '/brand/llms.txt',
    },
    gridUnit: manifest.gridUnit,
    clearSpace: manifest.clearSpace,
    brands: manifest.brands.map((brand) => ({id: brand.id, name: brand.name, backgrounds: brand.backgrounds, url: logoBrandUrl(brand.id)})),
  };
}

/** One brand's logos, favicons, profile pictures, and press kit. */
export async function logoBrands(): Promise<Array<LogoBrand & {pressKit?: string}>> {
  const manifest = await loadLogos();
  return manifest.brands.map((brand) => {
    const pressKit = manifest.pressKits?.[brand.id];
    return {...brand, ...(pressKit ? {pressKit} : {})};
  });
}

export async function guidelinesMarkdown(): Promise<string> {
  const markdown = await readFile(resolve(logosGuidelines, 'BRAND-GUIDELINES.md'), 'utf8');
  // Images are relative to the document; serve them from the logo package.
  const images = logoFileUrl(relative(logosDist, logosGuidelines));
  return markdown.replace(/<img src="([^"]+)" alt="([^"]*)"[^>]*>/g, `![$2](${images}/$1)`);
}

// Responses

/** Bulk files are compact; single resources are indented for reading. */
export function json(value: unknown, {compact = false} = {}): Response {
  const body = compact ? JSON.stringify(value) : JSON.stringify(value, null, 2);
  return new Response(`${body}\n`, {headers: {'Content-Type': 'application/json'}});
}

export function text(value: string, type = 'text/plain'): Response {
  return new Response(value, {headers: {'Content-Type': `${type}; charset=utf-8`}});
}
