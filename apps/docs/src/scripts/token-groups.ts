// Token groups in `components/token-area.tsx`: Expand all, and opening the group a URL hash points into.
// Delegated, so it survives page swaps.

const GROUP = 'details[data-filter-group]';

function groups(): HTMLDetailsElement[] {
  return [...document.querySelectorAll<HTMLDetailsElement>(GROUP)].filter((group) => !group.hidden);
}

/** Shows "Collapse all" once every visible group is open. */
function syncToggle(): void {
  const button = document.querySelector<HTMLElement>('[data-groups-toggle]');
  if (!button) return;
  const all = groups();
  button.textContent =
    all.length > 0 && all.every((group) => group.open) ? 'Collapse all' : 'Expand all';
}

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element) || !event.target.closest('[data-groups-toggle]')) return;
  const all = groups();
  const open = !all.every((group) => group.open);
  for (const group of all) group.open = open;
  syncToggle();
});

// `toggle` does not bubble; listen in the capture phase.
document.addEventListener(
  'toggle',
  (event) => {
    if (event.target instanceof HTMLDetailsElement && event.target.matches(GROUP)) syncToggle();
  },
  true,
);

/** Opens the group around the URL's target and scrolls to it. */
function revealTarget(): void {
  const id = decodeURIComponent(window.location.hash.slice(1));
  const target = id ? document.getElementById(id) : null;
  const group = target?.closest<HTMLDetailsElement>(GROUP);
  if (!target || !group) return;
  if (!group.open) group.open = true;
  target.scrollIntoView({block: 'start'});
}

window.addEventListener('hashchange', revealTarget);
document.addEventListener('astro:page-load', () => {
  revealTarget();
  syncToggle();
});
revealTarget();
