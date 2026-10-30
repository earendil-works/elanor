// The behaviors of the docs pages' static components, except the navigation's, which
// `navigation-behaviors.ts` attaches before the first paint: Elanor's, and the docs' own for
// copying a page as Markdown and for the search.
import {
  createCopyButton,
  createLinkedHeading,
  createModal,
  createPopover,
  createSearchDialog,
  createTableOfContents,
  createTableOfContentsMenu,
  createTopNavigationMenu,
} from '@earendil-works/elanor-react';

import {createCopyPage} from './copy-page.ts';
import {createDocsSearchSource} from './docs-search-source.ts';
import {createDocsSearch} from './docs-search.ts';
import {enhancePages} from './enhance-pages.ts';

enhancePages({
  popover: createPopover,
  modal: createModal,
  'top-navigation-menu': createTopNavigationMenu,
  'table-of-contents-menu': createTableOfContentsMenu,
  'table-of-contents': createTableOfContents,
  'copy-button': createCopyButton,
  'linked-heading': createLinkedHeading,
  'copy-page': createCopyPage,
  // The dialog names its search index.
  'search-dialog': (element) => {
    const indexUrl = element.dataset.docsSearchIndex;
    if (!indexUrl) throw new Error('The docs search dialog names no search index.');
    return createSearchDialog(element, createDocsSearchSource(indexUrl));
  },
  'docs-search': createDocsSearch,
});
