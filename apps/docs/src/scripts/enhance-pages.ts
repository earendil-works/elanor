import {enhance, type Behavior, type BehaviorFactory} from '@earendil-works/elanor-react';

/**
 * Attaches `behaviors` to the page now, and again to each page the client router swaps in, after
 * detaching them from the page it replaces. Returns a function that attaches them to elements
 * added since, such as the rest of the page after a script that runs during parsing.
 *
 * `enhance` knows only the behaviors it attached itself, and each script bundles its own copy, so
 * two scripts must not attach the same behavior.
 */
export function enhancePages(behaviors: Readonly<Record<string, BehaviorFactory>>): () => void {
  let attached: Behavior[] = enhance(behaviors);

  document.addEventListener('astro:before-swap', () => {
    for (const behavior of attached) behavior.destroy();
    attached = [];
  });
  // Before the new page is shown, so restored states don't flash.
  document.addEventListener('astro:after-swap', () => {
    attached = enhance(behaviors);
  });

  return () => {
    attached.push(...enhance(behaviors));
  };
}
