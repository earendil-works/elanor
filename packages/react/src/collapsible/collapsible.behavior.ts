import type {Behavior} from '../utils/enhance.ts';

interface CollapsibleParts {
  root: HTMLElement;
  trigger: HTMLElement;
  panel: HTMLElement;
}

// The root's own trigger, not a nested collapsible's.
function partsOf(root: HTMLElement): CollapsibleParts {
  const trigger = [...root.querySelectorAll<HTMLElement>('[data-elanor-collapsible-trigger]')].find(
    (element) => element.closest('[data-elanor~="collapsible"]') === root,
  );
  const panel = trigger
    ? root.ownerDocument.getElementById(trigger.getAttribute('aria-controls') ?? '')
    : null;
  if (!trigger || !panel) {
    throw new Error('Collapsible.StaticRoot needs a StaticTrigger and a StaticPanel.');
  }
  return {root, trigger, panel};
}

function setOpenState({root, trigger, panel}: CollapsibleParts, open: boolean): void {
  for (const element of [root, panel]) {
    element.toggleAttribute('data-open', open);
    element.toggleAttribute('data-closed', !open);
  }
  trigger.setAttribute('aria-expanded', String(open));
  trigger.toggleAttribute('data-panel-open', open);
}

function show(panel: HTMLElement): void {
  panel.removeAttribute('hidden');
  panel.removeAttribute('data-ending-style');
}

// `hidden="until-found"` keeps the box, so the measured height must go.
function hide(panel: HTMLElement): void {
  panel.style.removeProperty('--collapsible-panel-height');
  panel.setAttribute(
    'hidden',
    panel.hasAttribute('data-elanor-hidden-until-found') ? 'until-found' : '',
  );
  panel.removeAttribute('data-ending-style');
}

/**
 * Opens or closes a server-rendered `Collapsible.StaticRoot` at once, as when restoring its state
 * on load, whether or not `createCollapsible` is attached to it yet.
 */
export function setCollapsibleOpen(root: HTMLElement, open: boolean): void {
  const parts = partsOf(root);
  setOpenState(parts, open);
  if (open) {
    show(parts.panel);
    parts.panel.style.setProperty('--collapsible-panel-height', 'auto');
  } else hide(parts.panel);
}

/** Opens and closes a server-rendered `Collapsible.StaticRoot` without React. */
export function createCollapsible(root: HTMLElement): Behavior {
  const parts = partsOf(root);
  const {trigger, panel} = parts;
  let change = 0;

  async function transitionsEnd(current: number): Promise<boolean> {
    await Promise.allSettled(panel.getAnimations().map((animation) => animation.finished));
    return current === change;
  }

  function open(animate: boolean): void {
    const current = ++change;
    // A panel still closing grows back from its current height.
    const closing = panel.getAnimations().length > 0;
    setOpenState(parts, true);
    show(panel);
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
    setOpenState(parts, false);
    if (!animate) {
      hide(panel);
      return;
    }
    panel.style.setProperty('--collapsible-panel-height', `${panel.scrollHeight}px`);
    void panel.offsetHeight;
    panel.setAttribute('data-ending-style', '');
    void transitionsEnd(current).then((latest) => {
      if (latest) hide(panel);
    });
  }

  function onClick(event: MouseEvent): void {
    if (event.defaultPrevented || trigger.matches(':disabled')) return;
    if (root.hasAttribute('data-open')) close(true);
    else open(true);
  }

  function onBeforeMatch(): void {
    open(false);
  }

  if (root.hasAttribute('data-closed')) hide(panel);

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
