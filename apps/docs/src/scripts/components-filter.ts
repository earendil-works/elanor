/*
 * Filters the static components overview (`components/components-overview.tsx`). Listeners are
 * delegated, so they survive client-side page swaps; `?q=` pre-fills the search on each page load.
 */

const SEARCH = '[data-components-search]';

function terms(query: string): readonly string[] {
  return query.toLowerCase().trim().split(/\s+/).filter(Boolean);
}

/** Shows components whose name, description, or category contains every search term. */
function filter(input: HTMLInputElement): void {
  const overview = input.closest('[data-components-overview]');
  if (!overview) return;
  const words = terms(input.value);
  let total = 0;
  let shown = 0;

  for (const group of overview.querySelectorAll<HTMLElement>('[data-components-group]')) {
    const label = group.querySelector('h2')?.textContent ?? '';
    let visible = 0;
    for (const item of group.querySelectorAll<HTMLElement>('[data-components-item]')) {
      const text = `${item.textContent ?? ''} ${label}`.toLowerCase();
      const match = words.every((word) => text.includes(word));
      item.hidden = !match;
      if (match) visible += 1;
      total += 1;
    }
    group.hidden = visible === 0;
    shown += visible;
  }

  const empty = overview.querySelector<HTMLElement>('[data-components-empty]');
  if (empty) empty.hidden = shown > 0;
  const query = overview.querySelector('[data-components-query]');
  if (query) query.textContent = input.value.trim();
  const status = overview.querySelector('[data-components-status]');
  if (status) status.textContent = words.length > 0 ? `${shown} of ${total} components` : '';
}

document.addEventListener('input', (event) => {
  if (event.target instanceof HTMLInputElement && event.target.matches(SEARCH))
    filter(event.target);
});

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element) || !event.target.closest('[data-components-clear]'))
    return;
  const input = document.querySelector<HTMLInputElement>(SEARCH);
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
