// The docs search's results: the site's search index (`pages/search-index.json.ts`), searched
// with MiniSearch. Both load when the dialog first opens, once per session: the client router
// swaps the dialog, and with it the source, on every page.
import type {
  SearchDialogStaticResult,
  SearchDialogStaticSource,
} from '@earendil-works/elanor-react';
import type MiniSearch from 'minisearch';

import {docsSearchOptions, type DocsSearchRecord} from '../lib/search-options.ts';

async function loadIndex(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Docs search index: HTTP ${response.status}`);
  return await response.text();
}

/** Where a result sits: its group, and its page when the result is a section of it. */
function context(record: DocsSearchRecord): string {
  return [record.groupTitle, record.title === record.pageTitle ? '' : record.pageTitle]
    .filter(Boolean)
    .join(' › ');
}

/** The loaded indexes by URL, kept across the client router's page swaps. */
const indexes = new Map<string, MiniSearch<DocsSearchRecord>>();

export function createDocsSearchSource(indexUrl: string): SearchDialogStaticSource {
  return {
    async load() {
      if (indexes.has(indexUrl)) return;
      const [{default: Engine}, json] = await Promise.all([
        import('minisearch'),
        loadIndex(indexUrl),
      ]);
      indexes.set(indexUrl, Engine.loadJSON<DocsSearchRecord>(json, docsSearchOptions));
    },
    search(query): SearchDialogStaticResult[] {
      const index = indexes.get(indexUrl);
      // The dialog searches only once `load` resolved.
      if (!index) throw new Error(`Docs search index ${indexUrl} is not loaded.`);
      return index.search(query).map((result) => {
        const record = result as unknown as DocsSearchRecord;
        return {
          url: record.url,
          title: record.title,
          context: context(record),
          excerpt: record.excerpt,
        };
      });
    },
  };
}
