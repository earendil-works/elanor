/*
 * Filters static overview lists, such as the components overview and the token pages. Markup:
 *
 * - `data-filter="<noun>"` on the root; the noun names the items in the status, e.g. "components".
 * - `data-filter-search` on the search input.
 * - `data-filter-group` on each group, labelled by its first heading. A group that is a `<details>` opens
 *   while the search matches something in it, and returns to how it was when the search is cleared.
 * - Optional `data-filter-section` around groups; it hides when none of its groups match.
 * - `data-filter-item` on each item; `data-filter-text` adds text to match beyond the visible text, and
 *   `data-filter-count` counts an item as several, such as a token row with its states.
 * - Optional: `data-filter-status` (live count), `data-filter-empty` (shown when nothing matches),
 *   `data-filter-query` (the query, inside the empty state), and `data-filter-clear` (clears the search).
 *
 * Listeners are delegated, so they survive client-side page swaps; `?q=` pre-fills the search on each page load.
 */

const SEARCH = '[data-filter-search]';

function terms(query: string): readonly string[] {
  return query.toLowerCase().trim().split(/\s+/).filter(Boolean);
}

/** Shows items whose text, extra filter text, or group label contains every search term. */
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

/** Opens a group for the search, remembering whether it was open before the search. */
function reveal(group: HTMLDetailsElement, open: boolean): void {
  if (open) {
    if (!('filterWasOpen' in group.dataset)) group.dataset.filterWasOpen = String(group.open);
    group.open = true;
  } else if ('filterWasOpen' in group.dataset) {
    group.open = group.dataset.filterWasOpen === 'true';
    delete group.dataset.filterWasOpen;
  }
}

document.addEventListener('input', (event) => {
  if (event.target instanceof HTMLInputElement && event.target.matches(SEARCH))
    filter(event.target);
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
  input.focus();
});

function prefill(): void {
  const input = document.querySelector<HTMLInputElement>(SEARCH);
  if (!input) return;
  const initial = new URLSearchParams(window.location.search).get('q');
  if (initial) input.value = initial;
  // The browser may also restore a typed query, such as after going back.
  if (input.value) filter(input);
}

prefill();
document.addEventListener('astro:page-load', prefill);
