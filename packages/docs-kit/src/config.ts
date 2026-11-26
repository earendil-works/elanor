import {execFileSync} from 'node:child_process';
import {existsSync, readFileSync} from 'node:fs';
import {basename, dirname, extname, isAbsolute, join, relative, resolve, sep} from 'node:path';

/*
 * The docs kit's configuration: everything has a default, so a folder of Markdown is enough. A
 * project overrides what it needs in `elanor-docs.json` next to its Markdown, or in the options
 * of the Astro integration.
 */

/** The brands of `@earendil-works/design-tokens`. */
export const brands = ['earendil', 'pi', 'radius', 'lefos', 'elanor'] as const;
export type Brand = (typeof brands)[number];

/** The parts of the page a project can replace with its own `.astro` or React component. */
export const componentSlots = [
  'Head',
  'Identity',
  'BeforeArticle',
  'AfterArticle',
  'Footer',
] as const;
export type ComponentSlot = (typeof componentSlots)[number];

export interface DocsLink {
  readonly label: string;
  readonly href: string;
}

/**
 * An entry of the navigation: a page of the Markdown folder (`"guide/setup.md"`, or with its own
 * label), a link elsewhere, or a section of entries that expands.
 */
export type NavigationItem =
  | string
  | {readonly page: string; readonly label?: string}
  | {readonly link: string; readonly label: string}
  | {
      readonly section: string;
      readonly items: readonly NavigationItem[];
      /** Closed until opened, unless it holds the current page. Default: `false`. */
      readonly collapsed?: boolean;
    };

/** The navigation's top level: entries, and groups of entries under a heading. */
export type NavigationEntry =
  | NavigationItem
  | {readonly group: string; readonly items: readonly NavigationItem[]};

/** An image of the Markdown folder as the logo, with a version for dark mode if it needs one. */
export interface DocsLogo {
  /** The image, relative to the Markdown folder. */
  readonly light: string;
  /** The image in dark mode. Default: `light`. */
  readonly dark?: string;
  /** The image includes the name, such as a wordmark, so the name is not shown beside it. */
  readonly replacesName?: boolean;
}

/** A logo with its images as paths below the site's base. */
export interface ResolvedDocsLogo {
  readonly light: string;
  readonly dark: string | undefined;
  readonly replacesName: boolean;
}

/** The image types a logo and a favicon can be, which the site publishes from the Markdown folder. */
const imageExtensions = ['.svg', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.ico'];

/** What a project can set, in `elanor-docs.json` or as the integration's options. */
export interface DocsKitOptions {
  /** The Markdown folder. Default: `docs` if it exists, otherwise the project's folder. */
  readonly docs?: string;
  /** The project's name, shown beside the logo and in page titles. Default: from `package.json` or the Git remote. */
  readonly name?: string;
  /** One sentence about the project, for search engines, link previews, and `llms.txt`. */
  readonly description?: string;
  /** The design tokens' brand. Default: `earendil`. */
  readonly brand?: Brand;
  /**
   * The logo beside the name: an image of the Markdown folder (`"logo.svg"`), one for each color
   * scheme (`{"light": "logo.svg", "dark": "logo-dark.svg"}`), or `false` for the name alone.
   * Default: the brand's symbol.
   */
  readonly logo?: string | DocsLogo | false;
  /**
   * The favicon, an image of the Markdown folder. Default: the logo, unless it includes the name;
   * otherwise the brand's symbol.
   */
  readonly favicon?: string;
  /** Where the site is published, such as `https://earendil-works.github.io/absurd/`. Default: the GitHub Pages address of the Git remote. */
  readonly site?: string;
  /** The repository's web address, for the GitHub link and links to its files. Default: the Git remote, when it is on GitHub. */
  readonly repository?: string;
  /** The branch that links to the repository's files point at. Default: the remote's default branch, or `main`. */
  readonly branch?: string;
  /** Show when each page last changed, from Git. Default: `true`. */
  readonly lastUpdated?: boolean;
  /**
   * The side navigation, in order. Pages it doesn't list are built but not linked. Default: from
   * the folders, sorted by title.
   */
  readonly navigation?: readonly NavigationEntry[];
  /** Links in the top navigation, such as a changelog or a home page. */
  readonly links?: readonly DocsLink[];
  /** Stylesheets added after the kit's, relative to the Markdown folder. */
  readonly customCss?: readonly string[];
  /** Components that replace parts of the page, relative to the Markdown folder. */
  readonly components?: Partial<Record<ComponentSlot, string>>;
  /** Fail the build on broken links and other problems, instead of warning. Default: `false`. */
  readonly strict?: boolean;
}

/** The configuration with every default applied and every path absolute. */
export interface ResolvedDocsConfig {
  readonly docsDir: string;
  readonly name: string;
  readonly description: string | undefined;
  readonly brand: Brand;
  /** The logo; `undefined` for the brand's symbol, `false` for none. */
  readonly logo: ResolvedDocsLogo | false | undefined;
  /** The favicon's path below the site's base; `undefined` for the brand's symbol. */
  readonly favicon: string | undefined;
  readonly site: string | undefined;
  /** The site's path, such as `/absurd/`; always ends with a slash. */
  readonly base: string;
  readonly repository: string | undefined;
  /** The address of a file of the Markdown folder on GitHub when its path is appended, if known. */
  readonly sourceUrl: string | undefined;
  readonly lastUpdated: boolean;
  readonly navigation: readonly NavigationEntry[] | undefined;
  readonly links: readonly DocsLink[];
  readonly customCss: readonly string[];
  readonly components: Partial<Record<ComponentSlot, string>>;
  readonly strict: boolean;
}

export const configFileName = 'elanor-docs.json';

function git(cwd: string, args: readonly string[]): string | undefined {
  try {
    return execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return undefined;
  }
}

/** `git@github.com:owner/repo.git` or `https://github.com/owner/repo.git` as `https://github.com/owner/repo`. */
export function githubUrl(remote: string): string | undefined {
  const match = /github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?\/?$/.exec(remote.trim());
  return match ? `https://github.com/${match[1]}/${match[2]}` : undefined;
}

/** The GitHub Pages address of a repository: `https://owner.github.io/repo/`. */
export function githubPagesUrl(repository: string): string | undefined {
  const match = /^https:\/\/github\.com\/([^/]+)\/([^/]+)$/.exec(repository);
  if (!match) return undefined;
  const [, owner = '', repo = ''] = match;
  // A repository named after its owner's Pages domain is served at the root.
  if (repo.toLowerCase() === `${owner.toLowerCase()}.github.io`) return `https://${repo}/`;
  return `https://${owner.toLowerCase()}.github.io/${repo}/`;
}

/** `absurd-sdk` or `@scope/my-tool` as `Absurd sdk` or `My tool`. */
function displayName(packageName: string): string {
  const name = packageName.replace(/^@[^/]+\//, '').replace(/[-_]+/g, ' ');
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function readJson(path: string): Record<string, unknown> | undefined {
  if (!existsSync(path)) return undefined;
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
  } catch (error) {
    throw new Error(`Could not read ${path}: ${(error as Error).message}`, {cause: error});
  }
}

/** The Markdown folder: `docs` if it exists, otherwise the project's folder. */
export function findDocsDir(cwd: string, docs?: string): string {
  if (docs) return resolve(cwd, docs);
  const conventional = join(cwd, 'docs');
  return existsSync(conventional) ? conventional : cwd;
}

/** The options in the Markdown folder's `elanor-docs.json`, if it has one. */
export function readConfigFile(docsDir: string): DocsKitOptions {
  return (readJson(join(docsDir, configFileName)) ?? {}) as DocsKitOptions;
}

function normalizeBase(path: string): string {
  const trimmed = path.replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}/` : '/';
}

/** Checks the shape of the navigation in elanor-docs.json, which is hand-written JSON. */
function checkNavigation(entries: unknown): readonly NavigationEntry[] {
  const fail = (path: string, problem: string): never => {
    throw new Error(`The navigation in ${configFileName} ${problem} at ${path}.`);
  };
  const isText = (value: unknown) => typeof value === 'string' && value.length > 0;
  const item = (value: unknown, path: string, top: boolean): void => {
    if (isText(value)) return;
    if (typeof value !== 'object' || value === null)
      return fail(path, 'has neither a file nor an object');
    const entry = value as Record<string, unknown>;
    const list = (key: string) => {
      if (!Array.isArray(entry.items)) fail(path, `has a ${key} without "items"`);
      (entry.items as unknown[]).forEach((child, index) =>
        item(child, `${path}.items[${index}]`, false),
      );
    };
    if ('group' in entry) {
      if (!top) fail(path, 'has a group inside another entry; use "section" there');
      if (!isText(entry.group)) fail(path, 'has a group without a name');
      list('group');
    } else if ('section' in entry) {
      if (!isText(entry.section)) fail(path, 'has a section without a name');
      list('section');
    } else if ('page' in entry) {
      if (!isText(entry.page)) fail(path, 'has a page without a file');
    } else if ('link' in entry) {
      if (!isText(entry.link) || !isText(entry.label))
        fail(path, 'has a link without "link" and "label"');
    } else {
      fail(path, 'has an entry that is no page, link, section, or group');
    }
  };
  if (!Array.isArray(entries)) fail('the top', 'is not a list');
  (entries as unknown[]).forEach((entry, index) => item(entry, `[${index}]`, true));
  return entries as readonly NavigationEntry[];
}

/** Applies the defaults to `options`, read from the project at `cwd` and its Git repository. */
export function resolveConfig(cwd: string, options: DocsKitOptions = {}): ResolvedDocsConfig {
  const docsDir = findDocsDir(cwd, options.docs);
  if (!existsSync(docsDir)) throw new Error(`The Markdown folder ${docsDir} does not exist.`);
  const merged: DocsKitOptions = {...readConfigFile(docsDir), ...options};

  const repoRoot = git(docsDir, ['rev-parse', '--show-toplevel']);
  const remote = repoRoot ? git(repoRoot, ['remote', 'get-url', 'origin']) : undefined;
  const repository = merged.repository ?? (remote ? githubUrl(remote) : undefined);
  const defaultBranch = repoRoot
    ? git(repoRoot, ['symbolic-ref', '--short', 'refs/remotes/origin/HEAD'])?.replace(
        /^origin\//,
        '',
      )
    : undefined;
  const branch = merged.branch ?? defaultBranch ?? 'main';
  const docsPath = repoRoot ? relative(repoRoot, docsDir).split(sep).join('/') : undefined;
  const sourceUrl =
    repository && docsPath !== undefined && /^https:\/\/github\.com\//.test(repository)
      ? `${repository}/blob/${branch}/${docsPath ? `${docsPath}/` : ''}`
      : undefined;

  const packageJson =
    readJson(join(docsDir, 'package.json')) ??
    (repoRoot ? readJson(join(repoRoot, 'package.json')) : undefined) ??
    readJson(join(cwd, 'package.json'));
  const packageName = typeof packageJson?.name === 'string' ? packageJson.name : undefined;
  const repoName = repository?.split('/').pop();
  const fallbackDir = basename(docsDir) === 'docs' ? basename(dirname(docsDir)) : basename(docsDir);
  // A workspace root's package is often private and named for the workspace; prefer the repository.
  const name =
    merged.name ??
    displayName(
      (packageJson?.private === true ? undefined : packageName) ??
        repoName ??
        packageName ??
        fallbackDir,
    );

  const site = merged.site ?? (repository ? githubPagesUrl(repository) : undefined);
  const base = normalizeBase(site ? new URL(site).pathname : '/');

  const fromDocs = (path: string) => (isAbsolute(path) ? path : resolve(docsDir, path));
  const components: Partial<Record<ComponentSlot, string>> = {};
  for (const slot of componentSlots) {
    const path = merged.components?.[slot];
    if (path) components[slot] = fromDocs(path);
  }
  for (const slot of Object.keys(merged.components ?? {})) {
    if (!(componentSlots as readonly string[]).includes(slot)) {
      throw new Error(
        `Unknown component slot "${slot}" in ${configFileName}; the slots are ${componentSlots.join(', ')}.`,
      );
    }
  }
  if (merged.brand && !brands.includes(merged.brand)) {
    throw new Error(`Unknown brand "${merged.brand}"; the brands are ${brands.join(', ')}.`);
  }

  /** An image of the Markdown folder, checked, as its path with `/` separators. */
  const image = (field: string, path: string): string => {
    const absolute = resolve(docsDir, path);
    const rel = relative(docsDir, absolute).split(sep).join('/');
    if (rel.startsWith('../') || isAbsolute(rel)) {
      throw new Error(`The ${field} ${path} is outside the Markdown folder ${docsDir}.`);
    }
    if (!imageExtensions.includes(extname(rel).toLowerCase())) {
      throw new Error(`The ${field} ${path} is not an image (${imageExtensions.join(', ')}).`);
    }
    if (!existsSync(absolute)) throw new Error(`The ${field} ${path} does not exist.`);
    return rel;
  };
  const logoOption = merged.logo;
  const logo: ResolvedDocsLogo | false | undefined =
    logoOption === false || logoOption === undefined
      ? logoOption
      : typeof logoOption === 'string'
        ? {light: image('logo', logoOption), dark: undefined, replacesName: false}
        : {
            light: image('logo', logoOption.light),
            dark: logoOption.dark === undefined ? undefined : image('logo', logoOption.dark),
            replacesName: logoOption.replacesName ?? false,
          };
  const favicon =
    merged.favicon !== undefined
      ? image('favicon', merged.favicon)
      : logo && !logo.replacesName
        ? logo.light
        : undefined;

  return {
    docsDir,
    name,
    description: merged.description,
    brand: merged.brand ?? 'earendil',
    logo,
    favicon,
    site,
    base,
    repository,
    sourceUrl,
    lastUpdated: merged.lastUpdated ?? true,
    navigation: merged.navigation === undefined ? undefined : checkNavigation(merged.navigation),
    links: merged.links ?? [],
    customCss: (merged.customCss ?? []).map(fromDocs),
    components,
    strict: merged.strict ?? false,
  };
}
