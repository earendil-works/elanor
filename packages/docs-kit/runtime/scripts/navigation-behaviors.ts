// The navigation's behaviors, loaded as a classic script right after the side navigation (see
// `src/page-scripts.ts`): they restore its scroll position and draw its scroll area before the
// first paint. `page-behaviors.ts` attaches the rest once the page is parsed.
import {createScrollArea, createSideNavigation, enhance} from '@earendil-works/elanor-react';

const behaviors = {
  'side-navigation': createSideNavigation,
  'scroll-area': createScrollArea,
};

enhance(behaviors);
// Scroll areas after this script, such as the search results'.
document.addEventListener('DOMContentLoaded', () => enhance(behaviors), {once: true});
