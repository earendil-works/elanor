// The navigation's behaviors, loaded as a classic script right after the side navigation (see
// `plugins/page-scripts.ts`): they restore its sections and scroll position and draw its
// scroll area before the first paint, and make the sections in the top navigation's menu work.
// `page-behaviors.ts` attaches the rest once the page is parsed.
import {
  createCollapsible,
  createScrollArea,
  createSideNavigation,
} from '@earendil-works/elanor-react';

import {enhancePages} from './enhance-pages.ts';

const enhanceAdded = enhancePages({
  'side-navigation': createSideNavigation,
  collapsible: createCollapsible,
  'scroll-area': createScrollArea,
});

// Scroll areas and collapsibles after this script, such as the search results'.
document.addEventListener('DOMContentLoaded', enhanceAdded, {once: true});
