import type {Behavior} from '../utils/enhance.ts';

// The root's own trigger, not a nested collapsible's.
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

/** Opens and closes a server-rendered `Collapsible.StaticRoot` without React. */
export function createCollapsible(root: HTMLElement): Behavior {
  const {trigger, panel} = partsOf(root);
  const storageKey =
    root.dataset.elanorPersist === undefined
      ? null
      : `elanor:collapsible:${root.dataset.elanorPersist}`;
  const hiddenValue = panel.hasAttribute('data-elanor-hidden-until-found') ? 'until-found' : '';
  let change = 0;

  function setOpenState(open: boolean): void {
    for (const element of [root, panel]) {
      element.toggleAttribute('data-open', open);
      element.toggleAttribute('data-closed', !open);
    }
    trigger.setAttribute('aria-expanded', String(open));
    trigger.toggleAttribute('data-panel-open', open);
  }

  async function transitionsEnd(current: number): Promise<boolean> {
    await Promise.allSettled(panel.getAnimations().map((animation) => animation.finished));
    return current === change;
  }

  function open(animate: boolean): void {
    const current = ++change;
    // A panel still closing grows back from its current height.
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
      // Forces the starting style to apply before it is removed.
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
    panel.style.setProperty('--collapsible-panel-height', `${panel.scrollHeight}px`);
    void panel.offsetHeight;
    panel.setAttribute('data-ending-style', '');
    void transitionsEnd(current).then((latest) => {
      if (latest) hide();
    });
  }

  // `hidden="until-found"` keeps the box, so the measured height must go.
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
