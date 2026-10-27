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

// The section's own trigger and panel, not a nested section's.
function partsOf(section: HTMLElement): {trigger: HTMLElement; panel: HTMLElement} | null {
  const trigger = [...section.querySelectorAll<HTMLElement>('[aria-controls]')].find(
    (element) => element.closest('[data-elanor-section]') === section,
  );
  const panel = trigger
    ? section.ownerDocument.getElementById(trigger.getAttribute('aria-controls') ?? '')
    : null;
  return trigger && panel ? {trigger, panel} : null;
}

// Sets a section's state without animating, the way the collapsible behavior renders it.
function setSectionOpen(section: HTMLElement, open: boolean): void {
  const parts = partsOf(section);
  if (!parts) return;
  for (const element of [section, parts.panel]) {
    element.toggleAttribute('data-open', open);
    element.toggleAttribute('data-closed', !open);
  }
  parts.trigger.setAttribute('aria-expanded', String(open));
  parts.trigger.toggleAttribute('data-panel-open', open);
  parts.panel.style.removeProperty('--collapsible-panel-height');
  if (open) parts.panel.removeAttribute('hidden');
  else {
    const untilFound = parts.panel.hasAttribute('data-elanor-hidden-until-found');
    parts.panel.setAttribute('hidden', untilFound ? 'until-found' : '');
  }
}

/**
 * Restores a server-rendered `SideNavigation.StaticRoot` with `persist`: its sections' states
 * (a section with the current page stays open) and its scroll position, kept in session storage.
 * Then scrolls the current page's link into view when it is hidden.
 */
export function createSideNavigation(root: HTMLElement): Behavior {
  const scrollContainer = scrollContainerOf(root);
  const storageKey =
    root.dataset.elanorPersist === undefined
      ? null
      : `elanor:side-navigation:${root.dataset.elanorPersist}`;
  const stored = storageKey ? sessionStorage.getItem(storageKey) : null;
  const state: StoredState = stored ? (JSON.parse(stored) as StoredState) : {sections: {}};

  function save(): void {
    if (storageKey) sessionStorage.setItem(storageKey, JSON.stringify(state));
  }

  for (const section of root.querySelectorAll<HTMLElement>('[data-elanor-section]')) {
    const open = state.sections[section.dataset.elanorSection ?? ''];
    if (open === undefined) continue;
    if (!open && section.querySelector('[aria-current="page"]')) continue;
    setSectionOpen(section, open);
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

  // Records the reader's toggles: the section behavior has handled the click by now.
  function onClick(event: MouseEvent): void {
    const trigger =
      event.target instanceof Element ? event.target.closest('[aria-controls]') : null;
    const section = trigger?.closest<HTMLElement>('[data-elanor-section]');
    if (!section || !storageKey || partsOf(section)?.trigger !== trigger) return;
    state.sections[section.dataset.elanorSection ?? ''] = section.hasAttribute('data-open');
    save();
  }

  function onPageHide(): void {
    if (!scrollContainer) return;
    state.scrollTop = scrollContainer.scrollTop;
    save();
  }

  root.addEventListener('click', onClick);
  window.addEventListener('pagehide', onPageHide);
  return {
    destroy() {
      root.removeEventListener('click', onClick);
      window.removeEventListener('pagehide', onPageHide);
    },
  };
}
