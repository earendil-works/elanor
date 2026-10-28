import type {Behavior} from '../utils/enhance.ts';

// The root's own trigger, not a nested collapsible's.
function partsOf(root: HTMLElement): {trigger: HTMLElement; panel: HTMLElement} {
  const trigger = [...root.querySelectorAll<HTMLElement>('[data-elanor-collapsible-trigger]')].find(
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

  function onClick(event: MouseEvent): void {
    if (event.defaultPrevented || trigger.matches(':disabled')) return;
    if (root.hasAttribute('data-open')) close(true);
    else open(true);
  }

  function onBeforeMatch(): void {
    open(false);
  }

  if (root.hasAttribute('data-closed')) panel.setAttribute('hidden', hiddenValue);

  trigger.addEventListener('click', onClick);
  panel.addEventListener('beforematch', onBeforeMatch);
  return {
    destroy() {
      // Stops transitions still running from finishing the open or close.
      change++;
      trigger.removeEventListener('click', onClick);
      panel.removeEventListener('beforematch', onBeforeMatch);
    },
  };
}
