// The docs search's results: the site's search index (`pages/search-index.json.ts`), searched
// with MiniSearch. Both load when the dialog first opens.
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

export function createDocsSearchSource(indexUrl: string): SearchDialogStaticSource {
  let index: MiniSearch<DocsSearchRecord> | undefined;

  return {
    async load() {
      if (index) return;
      const [{default: Engine}, json] = await Promise.all([
        import('minisearch'),
        loadIndex(indexUrl),
      ]);
      index = Engine.loadJSON<DocsSearchRecord>(json, docsSearchOptions);
    },
    search(query): SearchDialogStaticResult[] {
      return (index?.search(query) ?? []).map((result) => {
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
