import {execFileSync} from 'node:child_process';
import {readdirSync, readFileSync, statSync} from 'node:fs';
import {join, relative, resolve, sep} from 'node:path';

import {parse as parseYaml} from 'yaml';

/*
 * The site's pages and navigation, read from the Markdown folder. Every `.md` file is a page:
 * `guide/setup.md` is served at `guide/setup/`, an `index.md` (or a `README.md` without one beside
 * it) at its folder. The navigation comes from the pages' front matter and folders: the pages
 * without a group first, then the groups, each named by `sidebar.group` or by its folder.
 */

export interface SiteOptions {
  readonly docsDir: string;
  /** The site's path, such as `/absurd/`. */
  readonly base: string;
  readonly lastUpdated: boolean;
  /** Folders inside the Markdown folder that hold no pages, such as the built site. */
  readonly exclude?: readonly string[];
}

/** Front matter the kit reads; the rest is kept for custom components. */
export interface PageFrontmatter {
  readonly title?: string;
  readonly description?: string;
  /** Left out of the site. */
  readonly draft?: boolean;
  readonly sidebar?: {
    /** The page's name in the navigation, if not its title. */
    readonly label?: string;
    /**
     * The navigation group the page is in. Default: the page's top folder, named by its
     * `index.md`; pages at the top have none.
     */
    readonly group?: string;
    /**
     * Sorts the pages of a group, lower first, then by name. A group sorts by its lowest order;
     * pages without one come after those with one.
     */
    readonly order?: number;
    /** Left out of the navigation; the page is still built. */
    readonly hidden?: boolean;
  };
  readonly [key: string]: unknown;
}

export interface DocsPage {
  /** The Markdown file, relative to the Markdown folder, with `/` separators. */
  readonly file: string;
  /** The page's path below the site's base, without slashes around it: `''` for the home page. */
  readonly slug: string;
  /** The page's address, with the site's base. */
  readonly url: string;
  readonly title: string;
  readonly description: string | undefined;
  readonly frontmatter: PageFrontmatter;
  /** The Markdown after the front matter. */
  readonly body: string;
  /** The last commit that changed the file, as an ISO 8601 date. */
  readonly lastUpdated: string | undefined;
}

export interface NavLink {
  readonly label: string;
  readonly page: DocsPage;
}

export interface NavGroup {
  /** A group's label; the first group of top-level pages has none. */
  readonly label: string | undefined;
  readonly links: readonly NavLink[];
}

export interface Site {
  readonly pages: readonly DocsPage[];
  readonly nav: readonly NavGroup[];
  /** The pages in navigation order, for "Previous" and "Next". */
  readonly sequence: readonly DocsPage[];
  /** Finds a page by its file, relative to the Markdown folder. */
  readonly byFile: ReadonlyMap<string, DocsPage>;
  readonly warnings: readonly string[];
}

/** Files that describe the repository for its contributors and agents rather than its users. */
const notPages = new Set(['AGENTS.md', 'CLAUDE.md']);

function markdownFiles(docsDir: string, exclude: readonly string[]): string[] {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, {withFileTypes: true})) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!exclude.some((excluded) => resolve(excluded) === path)) walk(path);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
        files.push(relative(docsDir, path).split(sep).join('/'));
      }
    }
  };
  walk(docsDir);
  return files.sort();
}

/** Splits YAML front matter from the Markdown after it. */
export function splitFrontmatter(source: string): {frontmatter: PageFrontmatter; body: string} {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!match) return {frontmatter: {}, body: source};
  const data: unknown = parseYaml(match[1] ?? '');
  const frontmatter = data && typeof data === 'object' ? (data as PageFrontmatter) : {};
  return {frontmatter, body: source.slice(match[0].length)};
}

/** Markdown without fenced code, so headings and paragraphs inside code are not read as such. */
function withoutCode(markdown: string): string {
  return markdown.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, '');
}

/** The text of the first `# ` heading, without inline Markdown. */
export function firstHeading(markdown: string): string | undefined {
  const match = /^#[ \t]+(.+?)[ \t#]*$/m.exec(withoutCode(markdown));
  return match ? plainInline(match[1] ?? '') : undefined;
}

/** The first paragraph after the title, as plain text, for descriptions. */
export function firstParagraph(markdown: string): string | undefined {
  for (const block of withoutCode(markdown).split(/\n\s*\n/)) {
    const text = block.trim();
    if (!text || /^(#|<|>|\||[-*+] |\d+\. |!\[|\[!|---|===|:::|!!!|\?\?\?)/.test(text)) continue;
    return plainInline(text.replace(/\s*\n\s*/g, ' '));
  }
  return undefined;
}

/** Inline Markdown as plain text: links keep their text, code and emphasis lose their marks. */
export function plainInline(text: string): string {
  return text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_~]/g, '')
    .trim();
}

function humanize(name: string): string {
  const words = name.replace(/\.md$/i, '').replace(/[-_]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** `index.md` and `guide/index.md` as `''` and `guide`; `guide/setup.md` as `guide/setup`. */
function slugOf(file: string, hasIndex: (dir: string) => boolean): string | undefined {
  const parts = file.replace(/\.md$/i, '').split('/');
  const name = parts.pop() ?? '';
  const dir = parts.join('/');
  if (name === 'index') return dir;
  if (name.toLowerCase() === 'readme') return hasIndex(dir) ? undefined : dir;
  return [...parts, name].join('/');
}

/** Each file's last commit date, from one `git log` of the Markdown folder. */
function commitDates(docsDir: string, warnings: string[]): Map<string, string> {
  const dates = new Map<string, string>();
  const run = (args: readonly string[]) =>
    execFileSync('git', args, {
      cwd: docsDir,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  try {
    if (run(['rev-parse', '--is-shallow-repository']).trim() === 'true') {
      warnings.push(
        'The Git history is shallow, so pages show no "Last updated" date. Fetch the whole history (`git fetch --unshallow`, or `fetch-depth: 0` in GitHub Actions).',
      );
      return dates;
    }
    let date = '';
    for (const line of run([
      'log',
      '--format=%x1e%cI',
      '--name-only',
      '--relative',
      '--',
      '.',
    ]).split('\n')) {
      if (line.startsWith('\x1e')) date = line.slice(1);
      else if (line && !dates.has(line)) dates.set(line, date);
    }
  } catch {
    // Not a Git repository, or no Git: pages show no date.
  }
  return dates;
}

function sortLinks(links: NavLink[]): NavLink[] {
  const order = (link: NavLink) => link.page.frontmatter.sidebar?.order ?? Number.POSITIVE_INFINITY;
  return links.sort(
    (a, b) => order(a) - order(b) || a.label.localeCompare(b.label, 'en', {numeric: true}),
  );
}

function navigation(pages: readonly DocsPage[]): NavGroup[] {
  const visible = pages.filter((page) => !page.frontmatter.sidebar?.hidden);
  const folderIndexes = new Map(
    visible
      .filter((page) => page.slug && !page.slug.includes('/') && page.file.includes('/'))
      .map((page) => [page.slug, page]),
  );
  const order = (page: DocsPage) => page.frontmatter.sidebar?.order ?? Number.POSITIVE_INFINITY;
  const label = (page: DocsPage) => page.frontmatter.sidebar?.label ?? page.title;

  const top: NavLink[] = [];
  const groups = new Map<string, NavLink[]>();
  for (const page of visible) {
    const folder = page.file.includes('/') ? (page.file.split('/')[0] ?? '') : undefined;
    const group =
      page.frontmatter.sidebar?.group ??
      (folder === undefined ? undefined : (folderIndexes.get(folder)?.title ?? humanize(folder)));
    // A folder's own page leads its group as its overview.
    const isOverview = folder !== undefined && folderIndexes.get(folder) === page;
    const link = {
      label: isOverview ? (page.frontmatter.sidebar?.label ?? 'Overview') : label(page),
      page,
    };
    if (group === undefined) top.push(link);
    else groups.set(group, [...(groups.get(group) ?? []), link]);
  }

  const sortGroup = (links: NavLink[]) => {
    const overview = links.filter(
      (link) =>
        link.page.frontmatter.sidebar?.order === undefined &&
        folderIndexes.get(link.page.slug) === link.page,
    );
    return [...overview, ...sortLinks(links.filter((link) => !overview.includes(link)))];
  };
  const home = top.filter((link) => link.page.slug === '');
  const result: NavGroup[] = [
    {label: undefined, links: [...home, ...sortLinks(top.filter((link) => link.page.slug !== ''))]},
  ];
  const sorted = [...groups].map(([groupLabel, links]) => ({
    label: groupLabel,
    order: Math.min(...links.map((link) => order(link.page))),
    links: sortGroup(links),
  }));
  sorted.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label, 'en', {numeric: true}));
  result.push(...sorted.map(({label: groupLabel, links}) => ({label: groupLabel, links})));
  return result.filter((group) => group.links.length > 0);
}

/** Reads the Markdown folder: its pages, their navigation, and what could not be read. */
export function readSite(options: SiteOptions): Site {
  const {docsDir, base} = options;
  const warnings: string[] = [];
  const files = markdownFiles(docsDir, options.exclude ?? []).filter((file) => !notPages.has(file));
  const fileSet = new Set(files);
  const hasIndex = (dir: string) => fileSet.has(dir ? `${dir}/index.md` : 'index.md');
  const dates = options.lastUpdated ? commitDates(docsDir, warnings) : new Map<string, string>();

  const pages: DocsPage[] = [];
  const byFile = new Map<string, DocsPage>();
  for (const file of files) {
    const slug = slugOf(file, hasIndex);
    if (slug === undefined) continue;
    const source = readFileSync(join(docsDir, file), 'utf8');
    let parsed: ReturnType<typeof splitFrontmatter>;
    try {
      parsed = splitFrontmatter(source);
    } catch (error) {
      warnings.push(`${file}: invalid front matter (${(error as Error).message})`);
      parsed = {frontmatter: {}, body: source};
    }
    const {frontmatter, body} = parsed;
    if (frontmatter.draft) continue;
    const name = file.split('/').at(-1) ?? file;
    const title =
      frontmatter.title ??
      firstHeading(body) ??
      humanize(/^(index|readme)\.md$/i.test(name) ? (file.split('/').at(-2) ?? 'Home') : name);
    const page: DocsPage = {
      file,
      slug,
      url: slug ? `${base}${slug}/` : base,
      title,
      description: frontmatter.description ?? firstParagraph(body),
      frontmatter,
      body,
      lastUpdated: dates.get(file),
    };
    pages.push(page);
    byFile.set(file, page);
  }

  const nav = navigation(pages);
  const sequence = [...new Set(nav.flatMap((group) => group.links.map((entry) => entry.page)))];
  return {pages, nav, sequence, byFile, warnings};
}

/** A cheap fingerprint of the Markdown folder, so the dev server rereads it only after changes. */
export function fingerprint(options: SiteOptions): string {
  return markdownFiles(options.docsDir, options.exclude ?? [])
    .map((file) => `${file}:${statSync(join(options.docsDir, file)).mtimeMs}`)
    .join('|');
}

let cached: {key: string; site: Site} | undefined;

/** The site, read once per change of the Markdown folder. */
export function loadSite(options: SiteOptions): Site {
  const key = `${JSON.stringify(options)}#${fingerprint(options)}`;
  if (cached?.key !== key) {
    const site = readSite(options);
    for (const warning of site.warnings) console.warn(`[elanor-docs] ${warning}`);
    cached = {key, site};
  }
  return cached.site;
}
