export type ColorScheme = 'light' | 'dark';

/** Dispatched on `window` after the color scheme changes. */
export const COLOR_SCHEME_EVENT = 'elanor-color-scheme';

// Keep in sync with src/components/color-scheme-script.astro.
const STORAGE_KEY = 'elanor-color-scheme';
const TOGGLE_SELECTOR = '[data-color-scheme-toggle]';
const root = document.documentElement;
const system = matchMedia('(prefers-color-scheme: dark)');

/** Set by the head script before first paint. */
export function currentColorScheme(): ColorScheme {
  return root.dataset.colorScheme === 'dark' ? 'dark' : 'light';
}

function savedColorScheme(): ColorScheme | undefined {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'dark' || saved === 'light' ? saved : undefined;
  } catch {
    return undefined;
  }
}

function save(scheme: ColorScheme): void {
  try {
    localStorage.setItem(STORAGE_KEY, scheme);
  } catch {
    // Without storage, the choice lasts for this page only.
  }
}

/** Toggles render without state; this syncs every copy. */
function syncToggles(): void {
  const pressed = String(currentColorScheme() === 'dark');
  for (const toggle of document.querySelectorAll(TOGGLE_SELECTOR)) {
    toggle.setAttribute('aria-pressed', pressed);
  }
}

function apply(scheme: ColorScheme): void {
  if (scheme !== currentColorScheme()) {
    root.dataset.colorScheme = scheme;
    window.dispatchEvent(new CustomEvent(COLOR_SCHEME_EVENT, {detail: {scheme}}));
  }
  syncToggles();
}

// Delegated, so swapped and hydrated toggles need no wiring.
document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element) || !event.target.closest(TOGGLE_SELECTOR)) return;
  const scheme = currentColorScheme() === 'dark' ? 'light' : 'dark';
  save(scheme);
  apply(scheme);
});

system.addEventListener('change', (event) => {
  if (!savedColorScheme()) apply(event.matches ? 'dark' : 'light');
});

window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY) {
    apply(savedColorScheme() ?? (system.matches ? 'dark' : 'light'));
  }
});

document.addEventListener('astro:after-swap', syncToggles);
syncToggles();
