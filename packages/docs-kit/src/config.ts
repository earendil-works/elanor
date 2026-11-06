import {execFileSync} from 'node:child_process';
import {existsSync, readFileSync} from 'node:fs';
import {basename, dirname, isAbsolute, join, relative, resolve, sep} from 'node:path';

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
  /** Where the site is published, such as `https://earendil-works.github.io/absurd/`. Default: the GitHub Pages address of the Git remote. */
  readonly site?: string;
  /** The repository's web address, for the GitHub link and links to its files. Default: the Git remote, when it is on GitHub. */
  readonly repository?: string;
  /** The branch that links to the repository's files point at. Default: the remote's default branch, or `main`. */
  readonly branch?: string;
  /** Show when each page last changed, from Git. Default: `true`. */
  readonly lastUpdated?: boolean;
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
  readonly site: string | undefined;
  /** The site's path, such as `/absurd/`; always ends with a slash. */
  readonly base: string;
  readonly repository: string | undefined;
  /** The address of a file of the Markdown folder on GitHub when its path is appended, if known. */
  readonly sourceUrl: string | undefined;
  readonly lastUpdated: boolean;
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

  return {
    docsDir,
    name,
    description: merged.description,
    brand: merged.brand ?? 'earendil',
    site,
    base,
    repository,
    sourceUrl,
    lastUpdated: merged.lastUpdated ?? true,
    links: merged.links ?? [],
    customCss: (merged.customCss ?? []).map(fromDocs),
    components,
    strict: merged.strict ?? false,
  };
}
