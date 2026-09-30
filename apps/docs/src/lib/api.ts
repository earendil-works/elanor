import {readdir, readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {dirname, resolve} from 'node:path';
import {type IconEntry, iconsDist, type LogoManifest, logosDist, logosGuidelines} from './packages.ts';

const require = createRequire(resolve(process.cwd(), 'package.json'));
const tokensDist = resolve(dirname(require.resolve('@earendil-works/design-tokens/radius.css')), '..');

export const tokenBrands = ['earendil', 'pi', 'radius', 'lefos'] as const;

type Scheme = 'light' | 'dark';

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
  name: string;
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
        name: token.path,
        type: token.type,
        description: token.description,
        cssVariable: token.cssVariable,
        light: mode('light'),
        dark: mode('dark'),
        ...(token.aliasOf ? {aliasOf: token.aliasOf} : {}),
        ...(token.extensions ? {extensions: token.extensions} : {}),
        url: `/api/tokens/${brand}/${token.path}.json`,
      };
    })
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

export async function tokensCss(brand: string): Promise<string> {
  return readFile(resolve(tokensDist, brand, 'tokens.css'), 'utf8');
}

export interface ApiIcon extends IconEntry {
  name: string;
  component: string;
  svg: string;
  react: string;
}

export async function loadIcons(): Promise<ApiIcon[]> {
  const metadata = JSON.parse(await readFile(resolve(iconsDist, 'metadata.json'), 'utf8')) as Record<string, IconEntry>;
  const names = (await readdir(resolve(iconsDist, 'svg'))).filter((file) => file.endsWith('.svg')).map((file) => file.slice(0, -4));
  return names.sort().map((name) => {
    const entry = metadata[name];
    if (!entry) throw new Error(`Missing search tags for ${name}`);
    const body = name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    const component = `${/^\d/.test(body) ? 'Number' : ''}${body}Icon`;
    return {
      name,
      component,
      tags: entry.tags,
      svg: `/api/icons/${name}.svg`,
      react: `import {${component}} from '@earendil-works/elanor-icons-react/${name}';`,
    };
  });
}

/** The logo manifest with every file path turned into its URL. */
export async function loadLogos(): Promise<LogoManifest> {
  const manifest = JSON.parse(await readFile(resolve(logosDist, 'manifest.json'), 'utf8')) as LogoManifest;
  const urls = (value: unknown, key?: string): unknown => {
    if (typeof value === 'string') return key === 'id' || !/\.[a-z]+$/.test(value) ? value : `/api/logos/${value}`;
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

export async function guidelinesMarkdown(): Promise<string> {
  const markdown = await readFile(resolve(logosGuidelines, 'BRAND-GUIDELINES.md'), 'utf8');
  return markdown.replace(/<img src="([^"]+)" alt="([^"]*)"[^>]*>/g, '![$2](/brand/guidelines/$1)');
}

/** Bulk files are compact; single resources are indented for reading. */
export function json(value: unknown, {compact = false} = {}): Response {
  const body = compact ? JSON.stringify(value) : JSON.stringify(value, null, 2);
  return new Response(`${body}\n`, {headers: {'Content-Type': 'application/json'}});
}

export function text(value: string, type = 'text/plain'): Response {
  return new Response(value, {headers: {'Content-Type': `${type}; charset=utf-8`}});
}
