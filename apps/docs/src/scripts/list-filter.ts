/*
 * Filters static lists. Markup:
 *
 * - `data-filter="<noun>"` on the root; the noun is used in the status, e.g. "3 of 61 components".
 * - `data-filter-search` on the input.
 * - `data-filter-group` on each group, labelled by its first heading. `<details>` groups open while they
 *   have matches and return to their previous state when the search is cleared.
 * - `data-filter-item` on each item. `data-filter-text` adds hidden match text; `data-filter-count`
 *   counts the item as several.
 * - Optional: `data-filter-section` (hides when none of its groups match), `data-filter-status`,
 *   `data-filter-empty`, `data-filter-query` (shows the query), and `data-filter-clear`.
 *
 * Delegated, so it survives page swaps. `?q=` pre-fills the search and follows it.
 */

const SEARCH = '[data-filter-search]';

function terms(query: string): readonly string[] {
  return query.toLowerCase().trim().split(/\s+/).filter(Boolean);
}

/** Shows items whose text, filter text, or group label contains every search term. */
function filter(input: HTMLInputElement): void {
  const root = input.closest<HTMLElement>('[data-filter]');
  if (!root) return;
  const words = terms(input.value);
  let total = 0;
  let shown = 0;

  for (const group of root.querySelectorAll<HTMLElement>('[data-filter-group]')) {
    const label = group.querySelector('h2, h3')?.textContent ?? '';
    let visible = 0;
    for (const item of group.querySelectorAll<HTMLElement>('[data-filter-item]')) {
      const text =
        `${item.textContent ?? ''} ${item.dataset.filterText ?? ''} ${label}`.toLowerCase();
      const match = words.every((word) => text.includes(word));
      const count = Number(item.dataset.filterCount ?? 1);
      item.hidden = !match;
      if (match) visible += count;
      total += count;
    }
    group.hidden = visible === 0;
    if (group instanceof HTMLDetailsElement) reveal(group, words.length > 0 && visible > 0);
    shown += visible;
  }

  for (const section of root.querySelectorAll<HTMLElement>('[data-filter-section]'))
    section.hidden = !section.querySelector('[data-filter-group]:not([hidden])');

  const empty = root.querySelector<HTMLElement>('[data-filter-empty]');
  if (empty) empty.hidden = shown > 0;
  const query = root.querySelector('[data-filter-query]');
  if (query) query.textContent = input.value.trim();
  const status = root.querySelector('[data-filter-status]');
  if (status)
    status.textContent = words.length > 0 ? `${shown} of ${total} ${root.dataset.filter}` : '';
}

/** Opens a group for the search and remembers its previous state. */
function reveal(group: HTMLDetailsElement, open: boolean): void {
  if (open) {
    if (!('filterWasOpen' in group.dataset)) group.dataset.filterWasOpen = String(group.open);
    group.open = true;
  } else if ('filterWasOpen' in group.dataset) {
    group.open = group.dataset.filterWasOpen === 'true';
    delete group.dataset.filterWasOpen;
  }
}

/** Keeps `?q=` in step with the search, so the filtered list can be shared. */
function syncUrl(input: HTMLInputElement): void {
  const url = new URL(window.location.href);
  const query = input.value.trim();
  if (query) url.searchParams.set('q', query);
  else url.searchParams.delete('q');
  // Keep the router's history state.
  history.replaceState(history.state, '', url);
}

document.addEventListener('input', (event) => {
  if (!(event.target instanceof HTMLInputElement) || !event.target.matches(SEARCH)) return;
  filter(event.target);
  syncUrl(event.target);
});

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const input = event.target
    .closest('[data-filter-clear]')
    ?.closest('[data-filter]')
    ?.querySelector<HTMLInputElement>(SEARCH);
  if (!input) return;
  input.value = '';
  filter(input);
  syncUrl(input);
  input.focus();
});

function prefill(): void {
  const input = document.querySelector<HTMLInputElement>(SEARCH);
  if (!input) return;
  const initial = new URLSearchParams(window.location.search).get('q');
  if (initial) input.value = initial;
  // The browser may restore a typed query, e.g. after going back.
  if (input.value) filter(input);
}

prefill();
document.addEventListener('astro:page-load', prefill);
