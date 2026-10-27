import {access, readFile, stat} from 'node:fs/promises';
import {resolve} from 'node:path';

import {type ApiToken, type ApiTokenValue, loadTokens} from './api.ts';
import {fontsDist} from './packages.ts';
import {firstFamily, tokenAreaHref, tokenAreaPage, tokenBrandOptions} from './token-pages.ts';

// Fonts page data, read at build time from the fonts package and each brand's token catalogue.

interface FamilySpec {
  readonly stylesheet: string;
  readonly license: string;
  readonly role: string;
  readonly sample: string;
}

const familySpecs: readonly FamilySpec[] = [
  {
    stylesheet: 'mallos-serif.css',
    license: 'mallos-serif.txt',
    role: 'Serif for text and headings.',
    sample: 'Sphinx of black quartz, judge my vow.',
  },
  {
    stylesheet: 'commit-mono.css',
    license: 'commit-mono.txt',
    role: 'Monospace for code.',
    sample: 'if (count >= 10) stop();',
  },
  {
    stylesheet: 'departure-mono.css',
    license: 'departure-mono.txt',
    role: 'Pixel monospace for Lefos.',
    sample: 'Pack my box with five dozen liquor jugs.',
  },
];

const licensesHref = 'https://github.com/earendil-works/elanor/blob/main/packages/fonts/licenses';

/** Served by `pages/fonts/files/[file].ts`. */
const fontDownloadHref = (file: string) => `/fonts/files/${file}`;

export interface FontLink {
  readonly label: string;
  readonly href: string;
}

export interface FontFace {
  /** `400`, `700 italic`, … */
  readonly label: string;
  readonly weight: string;
  readonly style: string;
  /** No file has this face; the browser synthesizes it. */
  readonly synthesized: boolean;
}

/** The text styles and family tokens that use a family in one brand. */
export interface FontUsage {
  readonly brand: string;
  readonly label: string;
  readonly styles: readonly FontLink[];
  readonly tokens: readonly FontLink[];
}

export interface FontFamily {
  /** The stylesheet without `.css`; also the section's anchor. */
  readonly id: string;
  /** The CSS `font-family` name. */
  readonly name: string;
  readonly stylesheet: string;
  readonly role: string;
  readonly sample: string;
  readonly faces: readonly FontFace[];
  /** E.g. `4 WOFF2 files, 35–43 KB each`. */
  readonly files: string;
  /** Desktop font files, one per face that has one. */
  readonly downloads: readonly FontLink[];
  readonly license: FontLink;
  readonly usage: readonly FontUsage[];
}

/** A primitive family token that names a font the package does not include. */
export interface MissingFont {
  readonly cssVariable: string;
  readonly name: string;
}

export interface FontsPage {
  readonly families: readonly FontFamily[];
  readonly missing: readonly MissingFont[];
}

// Stylesheets

interface FaceRule {
  readonly family: string;
  readonly weight: string;
  readonly style: string;
  readonly file: string;
  readonly format: string;
}

function faceRules(css: string, stylesheet: string): FaceRule[] {
  return [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map(([, block = '']) => {
    const read = (property: string) => {
      const value = new RegExp(`${property}:\\s*([^;]+);`).exec(block)?.[1]?.trim();
      if (!value) throw new Error(`${stylesheet}: @font-face without ${property}`);
      return value;
    };
    const src = /url\('\.\/files\/([^']+)'\)\s*format\('([^']+)'\)/.exec(read('src'));
    if (!src?.[1] || !src[2]) throw new Error(`${stylesheet}: unexpected src ${read('src')}`);
    return {
      family: read('font-family').replaceAll(/['"]/g, ''),
      weight: read('font-weight'),
      style: read('font-style'),
      file: src[1],
      format: src[2],
    };
  });
}

/** `400` → `['400']`; a variable range `400 700` → `['400', '700']`. */
const weightsOf = (weight: string) => weight.split(/\s+/);
const faceLabel = (weight: string, style: string) =>
  style === 'normal' ? weight : `${weight} ${style}`;
const kilobytes = (bytes: number) => Math.round(bytes / 1000);
const exists = (path: string) =>
  access(path).then(
    () => true,
    () => false,
  );

/** The `.otf` next to a web font, if any. */
async function desktopFile(file: string): Promise<string | undefined> {
  const otf = file.replace(/\.[^.]+$/, '.otf');
  return (await exists(resolve(fontsDist, 'files', otf))) ? otf : undefined;
}

/** Every desktop file, for the download route. */
export async function fontDownloads(): Promise<string[]> {
  const files: string[] = [];
  for (const spec of familySpecs) {
    const css = await readFile(resolve(fontsDist, spec.stylesheet), 'utf8');
    for (const rule of faceRules(css, spec.stylesheet)) {
      const otf = await desktopFile(rule.file);
      if (otf) files.push(otf);
    }
  }
  return files;
}

// Tokens

/** The first family a token names, in every context. */
function familiesOf(token: ApiToken): string[] {
  const contexts = Object.values(token.contexts ?? {}).flatMap((byContext): ApiTokenValue[] =>
    Object.values(byContext),
  );
  return [token, ...contexts]
    .map((value) => firstFamily(value.value))
    .filter((family) => family !== undefined);
}

interface BrandTypography {
  readonly brand: string;
  readonly label: string;
  readonly styles: ReadonlyArray<FontLink & {readonly paths: readonly string[]}>;
  readonly tokens: ReadonlyArray<FontLink & {readonly path: string}>;
  readonly byPath: ReadonlyMap<string, ApiToken>;
}

/** Each enabled brand's typography groups and family tokens, as listed on its typography page. */
async function brandTypography(): Promise<BrandTypography[]> {
  const brands = (await tokenBrandOptions()).filter((brand) => brand.enabled);
  return Promise.all(
    brands.map(async (brand) => {
      const page = await tokenAreaPage(brand.id, 'typography');
      const href = tokenAreaHref(brand.id, 'typography');
      const groups = page.sections.flatMap((section) =>
        section.groups.map((group) => ({section, group})),
      );
      return {
        brand: brand.id,
        label: brand.label,
        styles: groups
          .filter(({group}) => group.id !== 'families' && group.id !== 'weights')
          .map(({section, group}) => ({
            label: section.id === 'headings' ? `${group.label} headings` : group.label,
            href: `${href}#${section.id}-${group.id}`,
            paths: group.entries.flatMap((entry) => entry.states.map((state) => state.path)),
          })),
        tokens: groups
          .filter(({group}) => group.id === 'families')
          .flatMap(({group}) => group.entries.flatMap((entry) => entry.states))
          .map((state) => ({
            label: state.cssVariable,
            href: `${href}#${state.id}`,
            path: state.path,
          })),
        byPath: new Map((await loadTokens(brand.id)).map((token) => [token.path, token])),
      };
    }),
  );
}

function usageOf(name: string, brands: readonly BrandTypography[]): FontUsage[] {
  return brands
    .map((brand) => {
      const uses = (path: string) => {
        const token = brand.byPath.get(path);
        return token ? familiesOf(token).includes(name) : false;
      };
      return {
        brand: brand.brand,
        label: brand.label,
        styles: brand.styles
          .filter((style) => style.paths.some(uses))
          .map(({label, href}) => ({label, href})),
        tokens: brand.tokens
          .filter((token) => uses(token.path))
          .map(({label, href}) => ({label, href})),
      };
    })
    .filter((usage) => usage.styles.length > 0 || usage.tokens.length > 0);
}

// Page

async function family(spec: FamilySpec, brands: readonly BrandTypography[]): Promise<FontFamily> {
  const rules = faceRules(
    await readFile(resolve(fontsDist, spec.stylesheet), 'utf8'),
    spec.stylesheet,
  );
  const name = rules[0]?.family;
  if (!name || rules.some((rule) => rule.family !== name))
    throw new Error(`${spec.stylesheet} must declare one family`);

  const sizes = await Promise.all(
    rules.map(async (rule) => kilobytes((await stat(resolve(fontsDist, 'files', rule.file))).size)),
  );
  const low = Math.min(...sizes);
  const high = Math.max(...sizes);
  const formats = [...new Set(rules.map((rule) => rule.format.toUpperCase()))].join(', ');
  const files =
    rules.length === 1
      ? `1 ${formats} file, ${low} KB`
      : `${rules.length} ${formats} files, ${low === high ? low : `${low}–${high}`} KB each`;

  // A variable font's face covers a weight range (`400 700`): show its lightest and boldest weight.
  const faces: FontFace[] = rules.flatMap((rule) =>
    weightsOf(rule.weight).map((weight) => ({
      label: faceLabel(weight, rule.style),
      weight,
      style: rule.style,
      synthesized: false,
    })),
  );
  // Text styles use bold; without a bold file, show the synthesized face.
  if (!rules.some((rule) => Math.max(...weightsOf(rule.weight).map(Number)) >= 600))
    faces.push({label: '700, synthesized', weight: '700', style: 'normal', synthesized: true});

  const downloads: FontLink[] = [];
  for (const rule of rules) {
    const otf = await desktopFile(rule.file);
    if (otf)
      downloads.push({label: faceLabel(rule.weight, rule.style), href: fontDownloadHref(otf)});
  }

  return {
    id: spec.stylesheet.replace(/\.css$/, ''),
    name,
    stylesheet: spec.stylesheet,
    role: spec.role,
    sample: spec.sample,
    faces,
    files,
    downloads,
    license: {label: 'SIL OFL 1.1', href: `${licensesHref}/${spec.license}`},
    usage: usageOf(name, brands),
  };
}

export async function fontsPage(): Promise<FontsPage> {
  const brands = await brandTypography();
  const families = await Promise.all(familySpecs.map((spec) => family(spec, brands)));
  const shipped = new Set(families.map((item) => item.name));

  const missing = new Map<string, MissingFont>();
  for (const brand of brands) {
    for (const token of brand.byPath.values()) {
      if (token.type !== 'fontFamily' || !token.path.startsWith('primitive.')) continue;
      const name = firstFamily(token.value);
      if (name && !shipped.has(name))
        missing.set(`${token.cssVariable} ${name}`, {cssVariable: token.cssVariable, name});
    }
  }
  return {families, missing: [...missing.values()]};
}
