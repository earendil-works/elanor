// Tabs (Python-Markdown's `=== "Label"`, rendered by `content/markdown.ts`): the tab list switches
// the panels, with the arrow keys too. Choosing a label selects it in every set on the page that
// has it, and on the next pages; the chosen set stays where it is on the screen while sets above it
// change height.
import type {Behavior} from '@earendil-works/elanor-react';

const STORAGE_KEY = 'elanor-docs-tab';
const sets = new Set<HTMLElement>();

function tabsOf(set: HTMLElement): HTMLButtonElement[] {
  return [...set.querySelectorAll<HTMLButtonElement>(':scope > [role="tablist"] > [role="tab"]')];
}

function select(set: HTMLElement, tab: HTMLButtonElement): void {
  for (const candidate of tabsOf(set)) {
    const selected = candidate === tab;
    candidate.setAttribute('aria-selected', String(selected));
    candidate.tabIndex = selected ? 0 : -1;
    const panel = document.getElementById(candidate.getAttribute('aria-controls') ?? '');
    if (panel) panel.hidden = !selected;
  }
}

/** Selects the tab labeled `label` in every set that has one, but `except`. */
function selectEverywhere(label: string, except?: HTMLElement): void {
  for (const set of sets) {
    if (set === except) continue;
    const tab = tabsOf(set).find((candidate) => candidate.textContent?.trim() === label);
    if (tab) select(set, tab);
  }
}

export function createTabs(set: HTMLElement): Behavior {
  sets.add(set);
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const tab = tabsOf(set).find((candidate) => candidate.textContent?.trim() === saved);
    if (tab) select(set, tab);
  } catch {
    // Without storage, every page starts on its first tabs.
  }

  function choose(tab: HTMLButtonElement): void {
    const label = tab.textContent?.trim() ?? '';
    const top = set.getBoundingClientRect().top;
    select(set, tab);
    selectEverywhere(label, set);
    scrollBy({top: set.getBoundingClientRect().top - top, behavior: 'instant'});
    try {
      localStorage.setItem(STORAGE_KEY, label);
    } catch {
      // The choice lasts for this page only.
    }
  }

  function onClick(event: MouseEvent): void {
    const tab = event.target instanceof Element ? event.target.closest('[role="tab"]') : null;
    if (tab instanceof HTMLButtonElement && tabsOf(set).includes(tab)) choose(tab);
  }

  function onKeyDown(event: KeyboardEvent): void {
    const tabs = tabsOf(set);
    const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (current === -1) return;
    const step = {ArrowRight: 1, ArrowLeft: -1, Home: -current, End: tabs.length - 1 - current}[
      event.key
    ];
    if (step === undefined) return;
    event.preventDefault();
    const tab = tabs[(current + step + tabs.length) % tabs.length];
    if (!tab) return;
    tab.focus();
    choose(tab);
  }

  set.addEventListener('click', onClick);
  set.addEventListener('keydown', onKeyDown);
  return {
    destroy() {
      sets.delete(set);
      set.removeEventListener('click', onClick);
      set.removeEventListener('keydown', onKeyDown);
    },
  };
}
