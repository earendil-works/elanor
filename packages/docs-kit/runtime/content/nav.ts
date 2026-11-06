import type {NavigationEntry, NavigationItem} from '../../src/config.ts';
import {humanize, type DocsPage} from './site.ts';

/*
 * The navigation: groups under a heading, holding pages, links, and sections that expand. It comes
 * from `navigation` in elanor-docs.json, or without it, from the folders: the top-level pages, then
 * a group for each folder, its subfolders as sections.
 */

export type NavItem =
  | {readonly kind: 'page'; readonly label: string; readonly page: DocsPage}
  | {readonly kind: 'link'; readonly label: string; readonly href: string}
  | {
      readonly kind: 'section';
      readonly label: string;
      readonly items: readonly NavItem[];
      /** Closed until opened, unless it holds the current page. */
      readonly collapsed: boolean;
    };

export interface NavGroup {
  /** The group's heading; the group of top-level items has none. */
  readonly label: string | undefined;
  readonly items: readonly NavItem[];
}

/** The pages of `items`, in order, sections included. */
export function pagesOf(items: readonly NavItem[]): DocsPage[] {
  return items.flatMap((item) =>
    item.kind === 'page' ? [item.page] : item.kind === 'section' ? pagesOf(item.items) : [],
  );
}

function isGroup(entry: NavigationEntry): entry is Extract<NavigationEntry, {group: string}> {
  return typeof entry === 'object' && 'group' in entry;
}

/** The navigation as elanor-docs.json lists it; pages it doesn't list are built but not linked. */
export function configuredNavigation(
  entries: readonly NavigationEntry[],
  byFile: ReadonlyMap<string, DocsPage>,
  warnings: string[],
): NavGroup[] {
  const item = (entry: NavigationItem): NavItem[] => {
    if (typeof entry === 'string' || 'page' in entry) {
      const file = (typeof entry === 'string' ? entry : entry.page).replace(/^\.\//, '');
      const page = byFile.get(file);
      if (!page) {
        warnings.push(`The navigation in elanor-docs.json lists ${file}, which is not a page.`);
        return [];
      }
      const label = typeof entry === 'string' ? undefined : entry.label;
      return [{kind: 'page', label: label ?? page.title, page}];
    }
    if ('link' in entry) return [{kind: 'link', label: entry.label, href: entry.link}];
    return [
      {
        kind: 'section',
        label: entry.section,
        items: entry.items.flatMap(item),
        collapsed: entry.collapsed ?? false,
      },
    ];
  };

  const groups: {label: string | undefined; items: NavItem[]}[] = [];
  for (const entry of entries) {
    if (isGroup(entry)) {
      groups.push({label: entry.group, items: entry.items.flatMap(item)});
    } else {
      // Items outside a group gather in a group without a heading.
      const last = groups.at(-1);
      if (last && last.label === undefined) last.items.push(...item(entry));
      else groups.push({label: undefined, items: item(entry)});
    }
  }
  return groups.filter((group) => group.items.length > 0);
}

const byLabel = (a: {label: string}, b: {label: string}) =>
  a.label.localeCompare(b.label, 'en', {numeric: true});

/**
 * The navigation from the folders: the top-level pages, the home page first; then a group for each
 * top-level folder, named by its `index.md` (listed first, as "Overview"); deeper folders are
 * sections, closed until opened. Everything else sorts by title.
 */
export function folderNavigation(pages: readonly DocsPage[]): NavGroup[] {
  interface Folder {
    readonly name: string;
    index?: DocsPage;
    readonly pages: DocsPage[];
    readonly folders: Map<string, Folder>;
  }
  const folder = (name: string): Folder => ({name, pages: [], folders: new Map()});
  const root = folder('');
  for (const page of pages) {
    const parts = page.file.split('/').slice(0, -1);
    let current = root;
    for (const part of parts) {
      let next = current.folders.get(part);
      if (!next) current.folders.set(part, (next = folder(part)));
      current = next;
    }
    // The page a folder is served at: its index.md, or its README.md without one.
    if (parts.length > 0 && page.slug === parts.join('/')) current.index = page;
    else current.pages.push(page);
  }

  const pageItem = (page: DocsPage): NavItem => ({kind: 'page', label: page.title, page});
  const label = (entry: Folder) => entry.index?.title ?? humanize(entry.name);
  const contents = (entry: Folder): NavItem[] => [
    ...(entry.index ? [{kind: 'page', label: 'Overview', page: entry.index} as const] : []),
    ...entry.pages.map(pageItem).sort(byLabel),
    ...[...entry.folders.values()]
      .map((sub): NavItem => ({
        kind: 'section',
        label: label(sub),
        items: contents(sub),
        collapsed: true,
      }))
      .sort(byLabel),
  ];

  const home = root.pages.filter((page) => page.slug === '');
  const top = root.pages
    .filter((page) => page.slug !== '')
    .map(pageItem)
    .sort(byLabel);
  const groups: NavGroup[] = [{label: undefined, items: [...home.map(pageItem), ...top]}];
  const folders = [...root.folders.values()].map((entry) => ({
    label: label(entry),
    items: contents(entry),
  }));
  groups.push(...folders.sort(byLabel));
  return groups.filter((group) => group.items.length > 0);
}
