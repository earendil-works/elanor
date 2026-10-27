import type {Behavior} from '../utils/enhance.ts';

function scrollContainerOf(element: HTMLElement): HTMLElement | null {
  for (let current = element.parentElement; current; current = current.parentElement) {
    const {overflowY} = getComputedStyle(current);
    if (overflowY === 'auto' || overflowY === 'scroll') return current;
  }
  return null;
}

/**
 * Restores a server-rendered `SideNavigation.StaticRoot`'s scroll position with `persist`, then
 * scrolls the current page's link into view when it is hidden.
 */
export function createSideNavigation(root: HTMLElement): Behavior {
  const scrollContainer = scrollContainerOf(root);
  const storageKey =
    root.dataset.elanorPersist === undefined
      ? null
      : `elanor:side-navigation:${root.dataset.elanorPersist}`;

  if (scrollContainer && storageKey) {
    scrollContainer.scrollTop = Number(sessionStorage.getItem(storageKey) ?? 0);
  }
  const current = root.querySelector('[aria-current="page"]');
  if (scrollContainer && current) {
    const container = scrollContainer.getBoundingClientRect();
    const link = current.getBoundingClientRect();
    if (link.top < container.top || link.bottom > container.bottom) {
      scrollContainer.scrollTop += link.top - container.top - (container.height - link.height) / 2;
    }
  }

  function onPageHide(): void {
    if (scrollContainer && storageKey) {
      sessionStorage.setItem(storageKey, String(scrollContainer.scrollTop));
    }
  }

  window.addEventListener('pagehide', onPageHide);
  return {
    destroy() {
      window.removeEventListener('pagehide', onPageHide);
    },
  };
}
