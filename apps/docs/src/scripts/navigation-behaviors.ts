// The navigation's behaviors, loaded as a classic script right after the side navigation (see
// `plugins/page-scripts.ts`): they restore its scroll position and draw its scroll area before
// the first paint. `page-behaviors.ts` attaches the rest once the page is parsed.
import {createScrollArea, createSideNavigation} from '@earendil-works/elanor-react';

import {enhancePages} from './enhance-pages.ts';

const enhanceAdded = enhancePages({
  'side-navigation': createSideNavigation,
  'scroll-area': createScrollArea,
});

// Scroll areas after this script, such as the search results'.
document.addEventListener('DOMContentLoaded', enhanceAdded, {once: true});
