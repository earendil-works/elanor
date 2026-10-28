import {setCollapsibleOpen} from '../collapsible/collapsible.behavior.ts';
import type {Behavior} from '../utils/enhance.ts';

interface StoredState {
  scrollTop?: number;
  sections: Record<string, boolean>;
}

function scrollContainerOf(element: HTMLElement): HTMLElement | null {
  for (let current = element.parentElement; current; current = current.parentElement) {
    const {overflowY} = getComputedStyle(current);
    if (overflowY === 'auto' || overflowY === 'scroll') return current;
  }
  return null;
}

function isStorageError(error: unknown): error is DOMException {
  return (
    error instanceof DOMException &&
    (error.name === 'SecurityError' || error.name === 'QuotaExceededError')
  );
}

function reportStorageError(error: DOMException): void {
  reportError(
    new Error(`SideNavigation.StaticRoot can't use session storage: ${error.name}.`, {
      cause: error,
    }),
  );
}

/**
 * Restores a server-rendered `SideNavigation.StaticRoot` with `persist`: its sections' states
 * (a section with the current page stays open) and its scroll position, kept in session storage.
 * Then scrolls the current page's link into view when it is hidden. The scroll position is saved
 * when the page is hidden and on `destroy()`, so client-side routers that replace the navigation
 * keep it too. Where the browser blocks session storage or it is full, it reports the error and
 * the navigation works without it.
 */
export function createSideNavigation(root: HTMLElement): Behavior {
  const scrollContainer = scrollContainerOf(root);
  const storageKey =
    root.dataset.elanorPersist === undefined
      ? null
      : `elanor:side-navigation:${root.dataset.elanorPersist}`;
  // Blocked storage throws a SecurityError, as with cookies blocked or in a sandboxed iframe, and
  // full storage a QuotaExceededError. Keeping state is optional, so these are reported and turn
  // it off rather than stop the navigation and the behaviors attached after it.
  let storage: Storage | null = null;
  let stored: string | null = null;
  if (storageKey) {
    try {
      storage = window.sessionStorage;
      stored = storage.getItem(storageKey);
    } catch (error) {
      if (!isStorageError(error)) throw error;
      reportStorageError(error);
      storage = null;
    }
  }
  const state: StoredState = stored ? (JSON.parse(stored) as StoredState) : {sections: {}};

  function save(): void {
    if (!storage || !storageKey) return;
    try {
      storage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      if (!isStorageError(error)) throw error;
      reportStorageError(error);
      storage = null;
    }
  }

  for (const section of root.querySelectorAll<HTMLElement>('[data-elanor-section]')) {
    const open = state.sections[section.dataset.elanorSection ?? ''];
    if (open === undefined) continue;
    if (!open && section.querySelector('[aria-current="page"]')) continue;
    setCollapsibleOpen(section, open);
  }
  if (scrollContainer && state.scrollTop !== undefined) {
    scrollContainer.scrollTop = state.scrollTop;
  }
  const current = root.querySelector('[aria-current="page"]');
  if (scrollContainer && current) {
    const container = scrollContainer.getBoundingClientRect();
    const link = current.getBoundingClientRect();
    if (link.top < container.top || link.bottom > container.bottom) {
      scrollContainer.scrollTop += link.top - container.top - (container.height - link.height) / 2;
    }
  }

  // Records the state of the section that owns `element`, which its behavior has set by now.
  function record(element: Element): void {
    const section = element.closest<HTMLElement>('[data-elanor~="collapsible"]');
    const name = section?.dataset.elanorSection;
    if (!section || name === undefined || !root.contains(section)) return;
    state.sections[name] = section.hasAttribute('data-open');
    save();
  }

  function onClick(event: MouseEvent): void {
    const trigger =
      event.target instanceof Element
        ? event.target.closest('[data-elanor-collapsible-trigger]')
        : null;
    if (trigger) record(trigger);
  }

  // Find in page opens the panels that hide a match.
  function onBeforeMatch(event: Event): void {
    if (event.target instanceof Element) record(event.target);
  }

  function saveScrollPosition(): void {
    if (!scrollContainer) return;
    state.scrollTop = scrollContainer.scrollTop;
    save();
  }

  root.addEventListener('click', onClick);
  root.addEventListener('beforematch', onBeforeMatch);
  window.addEventListener('pagehide', saveScrollPosition);
  return {
    destroy() {
      // Client-side routers replace the navigation without leaving the page.
      saveScrollPosition();
      root.removeEventListener('click', onClick);
      root.removeEventListener('beforematch', onBeforeMatch);
      window.removeEventListener('pagehide', saveScrollPosition);
    },
  };
}
