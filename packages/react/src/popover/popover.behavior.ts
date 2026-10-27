import type {Behavior} from '../utils/enhance.ts';

function popupOf(positioner: HTMLElement): HTMLElement {
  const popup = positioner.firstElementChild;
  if (!(popup instanceof HTMLElement)) {
    throw new Error('Popover.StaticPositioner needs a StaticPopup.');
  }
  return popup;
}

// Keeps the popover this far from the window's edges, like the React positioner.
const collisionPadding = 5;

/**
 * Opens, places, and closes a server-rendered `Popover.StaticPositioner` without React. Without
 * the behavior, it is a native `popover="auto"`, centered in the window.
 */
export function createPopover(positioner: HTMLElement): Behavior {
  const popup = popupOf(positioner);
  const ownerDocument = positioner.ownerDocument;
  const buttons = [
    ...ownerDocument.querySelectorAll<HTMLButtonElement>(`[popovertarget="${positioner.id}"]`),
  ];
  const triggers = buttons.filter((button) => button.popoverTargetAction !== 'hide');
  let trigger = triggers[0];
  let change = 0;

  // Labels the popup only with a title and description that exist.
  for (const name of ['aria-labelledby', 'aria-describedby']) {
    const id = popup.getAttribute(name);
    if (id && !ownerDocument.getElementById(id)) popup.removeAttribute(name);
  }
  // The behavior handles dismissal, so it can animate closing.
  positioner.popover = 'manual';

  function isOpen(): boolean {
    return popup.hasAttribute('data-open');
  }

  function place(): void {
    if (!trigger) return;
    const anchor = trigger.getBoundingClientRect();
    const offset = Number(positioner.dataset.elanorSideOffset ?? 0);
    const align = positioner.dataset.align ?? 'center';
    const below = window.innerHeight - anchor.bottom - offset - collisionPadding;
    const above = anchor.top - offset - collisionPadding;
    const height = positioner.offsetHeight;
    // Flips to the other side when the preferred one is too small and the other has more room.
    let side = positioner.dataset.side === 'top' ? 'top' : 'bottom';
    if (side === 'bottom' && height > below && above > below) side = 'top';
    else if (side === 'top' && height > above && below > above) side = 'bottom';

    const width = positioner.offsetWidth;
    const rtl = getComputedStyle(trigger).direction === 'rtl';
    const start = rtl ? anchor.right - width : anchor.left;
    const end = rtl ? anchor.left : anchor.right - width;
    const center = anchor.left + (anchor.width - width) / 2;
    const left = Math.min(
      Math.max(align === 'start' ? start : align === 'end' ? end : center, collisionPadding),
      window.innerWidth - width - collisionPadding,
    );
    const top = side === 'bottom' ? anchor.bottom + offset : anchor.top - offset - height;

    positioner.style.inset = 'auto';
    positioner.style.margin = '0';
    positioner.style.top = `${top}px`;
    positioner.style.left = `${left}px`;
    positioner.style.setProperty('--anchor-width', `${anchor.width}px`);
    positioner.style.setProperty('--anchor-height', `${anchor.height}px`);
    positioner.style.setProperty(
      '--available-width',
      `${window.innerWidth - 2 * collisionPadding}px`,
    );
    positioner.style.setProperty('--available-height', `${side === 'bottom' ? below : above}px`);
    positioner.style.setProperty(
      '--transform-origin',
      `${anchor.left + anchor.width / 2 - left}px ${side === 'bottom' ? -offset : height + offset}px`,
    );
    for (const element of [positioner, popup]) {
      element.dataset.side = side;
      element.dataset.align = align;
    }
  }

  function setOpenState(open: boolean): void {
    popup.toggleAttribute('data-open', open);
    popup.toggleAttribute('data-closed', !open);
    for (const button of triggers) {
      button.setAttribute('aria-expanded', String(open && button === trigger));
      button.toggleAttribute('data-popup-open', open && button === trigger);
    }
  }

  async function transitionsEnd(current: number): Promise<boolean> {
    await Promise.allSettled(popup.getAnimations().map((animation) => animation.finished));
    return current === change;
  }

  function open(from: HTMLButtonElement): void {
    change += 1;
    trigger = from;
    popup.removeAttribute('data-ending-style');
    // The popup's first style is the starting one, so it transitions from there.
    popup.setAttribute('data-starting-style', '');
    positioner.showPopover();
    place();
    setOpenState(true);
    void popup.offsetHeight;
    popup.removeAttribute('data-starting-style');
    popup.focus({preventScroll: true});
    ownerDocument.addEventListener('pointerdown', onOutsidePress, true);
    ownerDocument.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
  }

  function close(returnFocus: boolean): void {
    const current = ++change;
    setOpenState(false);
    popup.setAttribute('data-ending-style', '');
    ownerDocument.removeEventListener('pointerdown', onOutsidePress, true);
    ownerDocument.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('resize', place);
    window.removeEventListener('scroll', place, true);
    if (returnFocus && popup.contains(ownerDocument.activeElement)) trigger?.focus();
    void transitionsEnd(current).then((latest) => {
      if (!latest) return;
      positioner.hidePopover();
      popup.removeAttribute('data-ending-style');
    });
  }

  function onButtonClick(event: MouseEvent): void {
    const button = event.currentTarget;
    if (!(button instanceof HTMLButtonElement)) return;
    // The behavior opens and closes instead of the browser, to place and animate the popover.
    event.preventDefault();
    if (button.popoverTargetAction === 'hide' || (isOpen() && button === trigger)) close(true);
    else open(button);
  }

  function onOutsidePress(event: PointerEvent): void {
    const target = event.target;
    if (!(target instanceof Node) || positioner.contains(target)) return;
    if (triggers.some((button) => button.contains(target))) return;
    close(false);
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    event.preventDefault();
    close(true);
  }

  for (const button of buttons) button.addEventListener('click', onButtonClick);
  return {
    destroy() {
      for (const button of buttons) button.removeEventListener('click', onButtonClick);
      ownerDocument.removeEventListener('pointerdown', onOutsidePress, true);
      ownerDocument.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      positioner.popover = 'auto';
    },
  };
}
