import type {Behavior} from '../utils/enhance.ts';

// The root's own trigger, not one of a nested collapsible, and the panel it controls.
function partsOf(root: HTMLElement): {trigger: HTMLElement; panel: HTMLElement} {
  const trigger = [...root.querySelectorAll<HTMLElement>('[aria-controls]')].find(
    (element) => element.closest('[data-elanor~="collapsible"]') === root,
  );
  const panel = trigger
    ? root.ownerDocument.getElementById(trigger.getAttribute('aria-controls') ?? '')
    : null;
  if (!trigger || !panel) {
    throw new Error('Collapsible.StaticRoot needs a StaticTrigger and a StaticPanel.');
  }
  return {trigger, panel};
}

/**
 * Makes a server-rendered `Collapsible.StaticRoot` open and close without React. It finds the
 * root's trigger by `aria-controls` and the panel by that id, and sets the states Base UI's
 * Collapsible sets, so the same stylesheet works for both: `data-open` or `data-closed` on the root
 * and panel, `aria-expanded` and `data-panel-open` on the trigger, and on the panel
 * `--collapsible-panel-height` with `data-starting-style` while opening and `data-ending-style`
 * while closing. The panel is hidden once its transitions end.
 *
 * With `data-elanor-persist` on the root, the open state is stored in local storage under that key
 * and restored when the behavior attaches. With `data-elanor-hidden-until-found` on the panel, a
 * closed panel is `hidden="until-found"`, so find in page searches it and opens it on a match.
 */
export function createCollapsible(root: HTMLElement): Behavior {
  const {trigger, panel} = partsOf(root);
  const storageKey =
    root.dataset.elanorPersist === undefined
      ? null
      : `elanor:collapsible:${root.dataset.elanorPersist}`;
  const hiddenValue = panel.hasAttribute('data-elanor-hidden-until-found') ? 'until-found' : '';
  // Counts changes, so a transition that ends after a newer change leaves the panel alone.
  let change = 0;

  function setOpenState(open: boolean): void {
    for (const element of [root, panel]) {
      element.toggleAttribute('data-open', open);
      element.toggleAttribute('data-closed', !open);
    }
    trigger.setAttribute('aria-expanded', String(open));
    trigger.toggleAttribute('data-panel-open', open);
  }

  // Resolves once the panel's transitions end, with whether no newer change happened meanwhile.
  async function transitionsEnd(current: number): Promise<boolean> {
    await Promise.allSettled(panel.getAnimations().map((animation) => animation.finished));
    return current === change;
  }

  function open(animate: boolean): void {
    const current = ++change;
    // A panel still closing grows back from its current height instead of starting at zero.
    const closing = panel.getAnimations().length > 0;
    setOpenState(true);
    panel.removeAttribute('hidden');
    panel.removeAttribute('data-ending-style');
    if (!animate) {
      panel.style.setProperty('--collapsible-panel-height', 'auto');
      return;
    }
    panel.style.setProperty('--collapsible-panel-height', `${panel.scrollHeight}px`);
    if (!closing) {
      panel.setAttribute('data-starting-style', '');
      // Applies the starting style before removing it, so the height transitions from zero.
      void panel.offsetHeight;
      panel.removeAttribute('data-starting-style');
    }
    void transitionsEnd(current).then((latest) => {
      if (latest) panel.style.setProperty('--collapsible-panel-height', 'auto');
    });
  }

  function close(animate: boolean): void {
    const current = ++change;
    setOpenState(false);
    if (!animate) {
      hide();
      return;
    }
    // From `auto`, the height needs a length to transition from.
    panel.style.setProperty('--collapsible-panel-height', `${panel.scrollHeight}px`);
    void panel.offsetHeight;
    panel.setAttribute('data-ending-style', '');
    void transitionsEnd(current).then((latest) => {
      if (latest) hide();
    });
  }

  // A panel hidden until found keeps its box, so it drops the measured height to take no space.
  function hide(): void {
    panel.style.removeProperty('--collapsible-panel-height');
    panel.setAttribute('hidden', hiddenValue);
    panel.removeAttribute('data-ending-style');
  }

  function remember(isOpen: boolean): void {
    if (storageKey) localStorage.setItem(storageKey, isOpen ? 'open' : 'closed');
  }

  function onClick(event: MouseEvent): void {
    if (event.defaultPrevented || trigger.matches(':disabled')) return;
    const next = !root.hasAttribute('data-open');
    if (next) open(true);
    else close(true);
    remember(next);
  }

  // Find in page found text in the closed panel; the browser shows it, and the panel opens.
  function onBeforeMatch(): void {
    open(false);
    remember(true);
  }

  const stored = storageKey ? localStorage.getItem(storageKey) : null;
  if (stored === 'open' && root.hasAttribute('data-closed')) open(false);
  else if (stored === 'closed' && root.hasAttribute('data-open')) close(false);
  else if (root.hasAttribute('data-closed')) panel.setAttribute('hidden', hiddenValue);

  trigger.addEventListener('click', onClick);
  panel.addEventListener('beforematch', onBeforeMatch);
  return {
    destroy() {
      trigger.removeEventListener('click', onClick);
      panel.removeEventListener('beforematch', onBeforeMatch);
    },
  };
}
