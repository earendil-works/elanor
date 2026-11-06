import type {APIRoute} from 'astro';
import MiniSearch from 'minisearch';

import {config, getSite, renderOptions} from '../content/context.ts';
import {renderPage} from '../content/markdown.ts';
import {pagesOf} from '../content/nav.ts';
import {docsSearchOptions, type DocsSearchRecord} from '../content/search-options.ts';

/*
 * The search index, loaded by the search dialog (`scripts/docs-search-source.ts`): each page's
 * introduction and each of its `##` sections, under the page's navigation group.
 */

function excerpt(text: string, length = 200): string {
  if (text.length <= length) return text;
  const cut = text.slice(0, length);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), length / 2))}…`;
}

export const GET: APIRoute = async () => {
  const site = getSite();
  const groups = new Map(
    site.nav.flatMap((group) => pagesOf(group.items).map((page) => [page, group.label] as const)),
  );
  const records: DocsSearchRecord[] = [];
  for (const page of site.pages) {
    const {sections} = await renderPage(page, site, renderOptions);
    const groupTitle = groups.get(page) ?? config.name;
    for (const section of sections) {
      const url = section.anchor ? `${page.url}#${section.anchor}` : page.url;
      records.push({
        id: url,
        url,
        title: section.anchor ? section.title : page.title,
        pageTitle: page.title,
        groupTitle,
        text: section.anchor ? `${section.title} ${section.text}` : section.text,
        excerpt: excerpt(section.anchor ? section.text : (page.description ?? section.text)),
      });
    }
  }
  const index = new MiniSearch<DocsSearchRecord>(docsSearchOptions);
  index.addAll(records);
  return new Response(JSON.stringify(index), {headers: {'Content-Type': 'application/json'}});
};
