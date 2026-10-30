import type {Options} from 'minisearch';

/** A page or a section of one in the docs search index. */
export interface DocsSearchRecord {
  readonly id: string;
  readonly url: string;
  readonly title: string;
  /** The page's title; the same as `title` for the page itself. */
  readonly pageTitle: string;
  /** The navigation group, such as "Components". */
  readonly groupTitle: string;
  /** Searched, not shown. */
  readonly text: string;
  readonly excerpt: string;
}

/** Shared by the index (`pages/search-index.json.ts`) and the browser that loads it. */
export const docsSearchOptions = {
  fields: ['title', 'pageTitle', 'groupTitle', 'text'],
  storeFields: ['url', 'title', 'pageTitle', 'groupTitle', 'excerpt'],
  searchOptions: {
    boost: {title: 3, pageTitle: 1.7, groupTitle: 1.15},
    prefix: true,
    fuzzy: 0.2,
  },
} satisfies Options<DocsSearchRecord>;
