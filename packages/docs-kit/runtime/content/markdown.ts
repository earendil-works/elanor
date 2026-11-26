import {posix} from 'node:path';

import elanorTheme from '@earendil-works/elanor-code-themes/shiki';
import Slugger from 'github-slugger';
import type {Element, ElementContent, Root, RootContent} from 'hast';
import type {Blockquote, Root as MdastRoot} from 'mdast';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import {bundledLanguages, createHighlighter, type BundledLanguage} from 'shiki';
import {unified} from 'unified';
import {visit} from 'unist-util-visit';

import {preprocessMarkdown} from './extensions.ts';
import type {DocsPage, Site} from './site.ts';

/*
 * A page's Markdown as a HAST tree for `DocsMarkdown`, which renders its elements as Elanor's
 * components. GitHub Flavored Markdown, including alerts (`> [!NOTE]`), and inline HTML. Links to
 * other Markdown files point at their pages; links to files outside the Markdown folder point at
 * the repository.
 */

export interface TocEntry {
  readonly depth: number;
  readonly id: string;
  readonly title: string;
}

/** A part of a page for the search: the text before the first `##`, then each `##` section. */
export interface PageSection {
  /** The heading's id; empty for the part before the first heading. */
  readonly anchor: string;
  readonly title: string;
  readonly text: string;
}

export interface RenderedPage {
  readonly tree: Root;
  readonly toc: readonly TocEntry[];
  readonly sections: readonly PageSection[];
}

export interface RenderOptions {
  /** The site's path, such as `/absurd/`. */
  readonly base: string;
  /** The address of a repository file when its path, relative to the Markdown folder, is appended. */
  readonly sourceUrl: string | undefined;
  /** Files of the Markdown folder that are not pages, such as images; checked for broken links. */
  readonly fileExists: (file: string) => boolean;
}

export const alertTypes = ['note', 'tip', 'important', 'warning', 'caution'] as const;
export type AlertType = (typeof alertTypes)[number];

/** Python-Markdown's admonition types as GitHub's alert types. */
const admonitionAlerts: Record<string, AlertType> = {
  tip: 'tip',
  hint: 'tip',
  success: 'tip',
  check: 'tip',
  done: 'tip',
  important: 'important',
  warning: 'warning',
  attention: 'warning',
  caution: 'warning',
  danger: 'caution',
  error: 'caution',
  failure: 'caution',
  fail: 'caution',
  missing: 'caution',
  bug: 'caution',
};

function alertType(admonition: string): AlertType {
  return admonitionAlerts[admonition.toLowerCase()] ?? 'note';
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** GitHub's alerts: a quote starting with `[!NOTE]` becomes a note, marked `data-alert`. */
function remarkAlerts() {
  return (tree: MdastRoot) => {
    visit(tree, 'blockquote', (node: Blockquote) => {
      const paragraph = node.children[0];
      const text = paragraph?.type === 'paragraph' ? paragraph.children[0] : undefined;
      if (text?.type !== 'text') return;
      const match = /^\[!(\w+)\][ \t]*(?:\r?\n|$)/.exec(text.value);
      const type = match?.[1]?.toLowerCase() as AlertType | undefined;
      if (!match || !type || !alertTypes.includes(type)) return;
      text.value = text.value.slice(match[0].length);
      if (!text.value && paragraph?.type === 'paragraph') {
        paragraph.children.shift();
        // A soft break left at the start of the paragraph.
        if (paragraph.children[0]?.type === 'break') paragraph.children.shift();
        if (paragraph.children.length === 0) node.children.shift();
      }
      node.data = {...node.data, hProperties: {dataAlert: type}};
    });
  };
}

/** The text of a HAST node. */
export function textOf(node: Root | RootContent | ElementContent): string {
  if (node.type === 'text') return node.value;
  if ('children' in node) return node.children.map((child) => textOf(child)).join('');
  return '';
}

const blockTags = new Set([
  'p',
  'li',
  'ul',
  'ol',
  'dl',
  'dt',
  'dd',
  'table',
  'tr',
  'td',
  'th',
  'blockquote',
  'div',
  'details',
  'summary',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'br',
  'button',
]);

/** Searchable text: no code blocks, and blocks separated by spaces. */
function searchText(nodes: readonly (RootContent | ElementContent)[]): string {
  const parts: string[] = [];
  const walk = (node: RootContent | ElementContent) => {
    if (node.type === 'text') parts.push(node.value);
    else if (node.type === 'element') {
      // Code blocks, and the tab lists, whose labels the panels repeat.
      if (node.tagName === 'pre' || node.properties.role === 'tablist') return;
      node.children.forEach(walk);
      if (blockTags.has(node.tagName)) parts.push(' ');
    }
  };
  nodes.forEach(walk);
  return parts.join('').replace(/\s+/g, ' ').trim();
}

let highlighter: ReturnType<typeof createHighlighter> | undefined;
const languageAliases: Record<string, string> = {
  console: 'shellsession',
  cron: 'text',
  text: 'text',
};

async function highlight(code: string, language: string): Promise<Root> {
  highlighter ??= createHighlighter({themes: [elanorTheme], langs: []});
  const shiki = await highlighter;
  const alias = languageAliases[language] ?? language;
  const lang = alias in bundledLanguages ? alias : 'text';
  if (lang !== 'text' && !shiki.getLoadedLanguages().includes(lang)) {
    await shiki.loadLanguage(lang as BundledLanguage);
  }
  return shiki.codeToHast(code, {lang, theme: 'elanor'});
}

function isElement(node: RootContent | ElementContent | undefined, tag?: string): node is Element {
  return node?.type === 'element' && (tag === undefined || node.tagName === tag);
}

/** Splits a URL into its path and the `?query#hash` after it. */
function splitUrl(url: string): [string, string] {
  const index = url.search(/[?#]/);
  return index === -1 ? [url, ''] : [url.slice(0, index), url.slice(index)];
}

/** A link of the page `from` as the site's address of its target. */
export function resolveLink(
  href: string,
  from: DocsPage,
  site: Pick<Site, 'byFile'>,
  options: RenderOptions,
  warnings: string[],
): string {
  // Absolute addresses, the page's own anchors, and site paths stay as they are.
  if (/^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith('#') || href.startsWith('/')) return href;
  const [path, suffix] = splitUrl(href);
  if (!path) return href;
  const target = posix.normalize(posix.join(posix.dirname(from.file), decodeURI(path)));
  if (target.startsWith('../') || target === '..') {
    // Outside the Markdown folder: the file in the repository.
    if (options.sourceUrl) return new URL(`${target}${suffix}`, options.sourceUrl).href;
    warnings.push(`${from.file}: ${href} is outside the Markdown folder.`);
    return href;
  }
  const page =
    site.byFile.get(target) ??
    site.byFile.get(posix.join(target, 'index.md')) ??
    site.byFile.get(posix.join(target, 'README.md'));
  if (page) return `${page.url}${suffix}`;
  if (target.toLowerCase().endsWith('.md') || !options.fileExists(target)) {
    warnings.push(`${from.file}: ${href} is not a page or file of the Markdown folder.`);
    return href;
  }
  return `${options.base}${target.split('/').map(encodeURIComponent).join('/')}${suffix}`;
}

/** Renders a page's Markdown, and returns its table of contents and its sections for the search. */
export async function renderPage(
  page: DocsPage,
  site: Pick<Site, 'byFile'>,
  options: RenderOptions,
  warnings: string[] = [],
): Promise<RenderedPage> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkAlerts)
    .use(remarkRehype, {allowDangerousHtml: true})
    .use(rehypeRaw);
  const tree = (await processor.run(processor.parse(preprocessMarkdown(page.body)))) as Root;

  const slugger = new Slugger();
  const toc: TocEntry[] = [];
  const blocks: {node: Element; language: string; code: string}[] = [];
  let removedTitle = false;
  let tabSets = 0;

  visit(tree, 'element', (node, index, parent) => {
    // Python-Markdown's admonitions (`extensions.ts`) as GitHub's alerts, or as disclosures.
    const admonition = node.properties.dataAdmonition;
    if (typeof admonition === 'string') {
      const title =
        typeof node.properties.dataTitle === 'string' ? node.properties.dataTitle : undefined;
      if (node.tagName === 'details') {
        const summary: Element = {
          type: 'element',
          tagName: 'summary',
          properties: {},
          children: [{type: 'text', value: title ?? capitalize(admonition)}],
        };
        node.properties = {className: ['docs-details'], open: node.properties.open};
        node.children = [summary, ...node.children];
      } else {
        node.tagName = 'blockquote';
        node.properties = {
          dataAlert: alertType(admonition),
          ...(title === undefined ? {} : {dataTitle: title}),
        };
      }
      return undefined;
    }
    // Tabs (`extensions.ts`): a tab list and a panel for each tab; `scripts/tabs.ts` switches them.
    if (node.properties.dataTabs !== undefined) {
      const set = (tabSets += 1);
      const tabs = node.children.filter(
        (child): child is Element =>
          isElement(child) && typeof child.properties.dataTab === 'string',
      );
      const id = (part: string, tab: number) => `docs-tabs-${set}-${part}-${tab}`;
      node.properties = {className: ['docs-tabs'], dataElanor: 'docs-tabs'};
      node.children = [
        {
          type: 'element',
          tagName: 'div',
          properties: {className: ['docs-tabs-list'], role: 'tablist'},
          children: tabs.map((tab, tabIndex) => ({
            type: 'element',
            tagName: 'button',
            properties: {
              type: 'button',
              role: 'tab',
              id: id('tab', tabIndex),
              className: ['docs-tabs-tab'],
              ariaControls: [id('panel', tabIndex)],
              ariaSelected: String(tabIndex === 0),
              tabIndex: tabIndex === 0 ? 0 : -1,
            },
            children: [{type: 'text', value: String(tab.properties.dataTab)}],
          })),
        },
        ...tabs.map((tab, tabIndex): Element => ({
          type: 'element',
          tagName: 'div',
          properties: {
            role: 'tabpanel',
            id: id('panel', tabIndex),
            className: ['docs-tabs-panel'],
            ariaLabelledBy: [id('tab', tabIndex)],
            hidden: tabIndex !== 0,
          },
          children: tab.children,
        })),
      ];
      return undefined;
    }
    const level = /^h([1-6])$/.exec(node.tagName)?.[1];
    if (level) {
      const title = textOf(node).trim();
      // The page header shows the title, so the content's first H1 goes.
      if (level === '1' && !removedTitle && parent && index !== undefined) {
        removedTitle = true;
        parent.children.splice(index, 1);
        return index;
      }
      const id = typeof node.properties.id === 'string' ? node.properties.id : slugger.slug(title);
      node.properties.id = id;
      if (level === '2' || level === '3') toc.push({depth: Number(level), id, title});
      return undefined;
    }
    if (node.tagName === 'a' && typeof node.properties.href === 'string') {
      node.properties.href = resolveLink(node.properties.href, page, site, options, warnings);
    }
    if (node.tagName === 'img' && typeof node.properties.src === 'string') {
      node.properties.src = resolveLink(node.properties.src, page, site, options, warnings);
    }
    if (node.tagName === 'pre' && isElement(node.children[0], 'code')) {
      const code = node.children[0];
      const className = Array.isArray(code.properties.className) ? code.properties.className : [];
      const language = className
        .map(String)
        .find((name) => name.startsWith('language-'))
        ?.slice('language-'.length);
      blocks.push({node, language: language ?? 'text', code: textOf(code).replace(/\n$/, '')});
      return 'skip';
    }
    return undefined;
  });

  // Code blocks: Shiki's highlighted `code`, inside a `pre` that keeps the language and the code
  // for the copy button.
  for (const block of blocks) {
    const highlighted = await highlight(block.code, block.language);
    const pre = highlighted.children.find((node) => isElement(node, 'pre'));
    const code =
      pre && isElement(pre) ? pre.children.find((node) => isElement(node, 'code')) : undefined;
    block.node.properties = {dataLanguage: block.language, dataCode: block.code};
    block.node.children = code && isElement(code) ? [code] : block.node.children;
  }

  // The search's sections: the introduction, then each `##` section.
  const sections: PageSection[] = [];
  let current: {anchor: string; title: string; nodes: RootContent[]} = {
    anchor: '',
    title: page.title,
    nodes: [],
  };
  for (const node of tree.children) {
    if (isElement(node, 'h2')) {
      sections.push({...current, text: searchText(current.nodes)});
      current = {anchor: String(node.properties.id), title: textOf(node).trim(), nodes: []};
    } else {
      current.nodes.push(node);
    }
  }
  sections.push({...current, text: searchText(current.nodes)});

  return {tree, toc, sections: sections.filter((section) => section.anchor || section.text)};
}
