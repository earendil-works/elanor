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

const tabbable =
  'a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

// The open popovers, most recent last, so Escape closes only the top one.
const openPositioners: HTMLElement[] = [];

function removeOpen(positioner: HTMLElement): void {
  const index = openPositioners.indexOf(positioner);
  if (index !== -1) openPositioners.splice(index, 1);
}

/** Event that closes an open static popover when dispatched on its positioner. */
export const popoverCloseEvent = 'elanor:popover-close';

/**
 * Opens, places, and closes a server-rendered `Popover.StaticPositioner` without React. Without
 * the behavior, it is a native `popover="auto"`, centered in the window. Dispatch
 * `popoverCloseEvent` on the positioner to close it.
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
    const align = positioner.dataset.elanorAlign ?? 'center';
    const requested = positioner.dataset.elanorSide ?? 'bottom';
    const rtl = getComputedStyle(trigger).direction === 'rtl';
    const room = {
      top: anchor.top - offset - collisionPadding,
      bottom: window.innerHeight - anchor.bottom - offset - collisionPadding,
      left: anchor.left - offset - collisionPadding,
      right: window.innerWidth - anchor.right - offset - collisionPadding,
    };
    const opposite = {top: 'bottom', bottom: 'top', left: 'right', right: 'left'} as const;
    // Logical sides follow the writing direction.
    let side: keyof typeof room =
      requested === 'inline-start'
        ? rtl
          ? 'right'
          : 'left'
        : requested === 'inline-end'
          ? rtl
            ? 'left'
            : 'right'
          : requested === 'top' || requested === 'left' || requested === 'right'
            ? requested
            : 'bottom';
    const resolved = side;
    const vertical = side === 'top' || side === 'bottom';
    const windowWidth = window.innerWidth - 2 * collisionPadding;
    const windowHeight = window.innerHeight - 2 * collisionPadding;

    // Sets the size limits the popup's styles read, then measures it within them.
    function measure(availableWidth: number, availableHeight: number): [number, number] {
      positioner.style.setProperty('--available-width', `${availableWidth}px`);
      positioner.style.setProperty('--available-height', `${availableHeight}px`);
      return [positioner.offsetWidth, positioner.offsetHeight];
    }

    // Flips to the other side when the popup at its natural size doesn't fit the preferred one and
    // the other has more room.
    const [naturalWidth, naturalHeight] = measure(windowWidth, windowHeight);
    if (
      (vertical ? naturalHeight : naturalWidth) > room[side] &&
      room[opposite[side]] > room[side]
    ) {
      side = opposite[side];
    }
    const [width, height] = vertical
      ? measure(windowWidth, room[side])
      : measure(room[side], windowHeight);

    let top: number;
    let left: number;
    if (vertical) {
      const start = rtl ? anchor.right - width : anchor.left;
      const end = rtl ? anchor.left : anchor.right - width;
      const center = anchor.left + (anchor.width - width) / 2;
      left = align === 'start' ? start : align === 'end' ? end : center;
      top = side === 'bottom' ? anchor.bottom + offset : anchor.top - offset - height;
    } else {
      const center = anchor.top + (anchor.height - height) / 2;
      top = align === 'start' ? anchor.top : align === 'end' ? anchor.bottom - height : center;
      left = side === 'right' ? anchor.right + offset : anchor.left - offset - width;
    }
    left = Math.min(Math.max(left, collisionPadding), window.innerWidth - width - collisionPadding);
    top = Math.min(Math.max(top, collisionPadding), window.innerHeight - height - collisionPadding);

    positioner.style.inset = 'auto';
    positioner.style.margin = '0';
    positioner.style.top = `${top}px`;
    positioner.style.left = `${left}px`;
    positioner.style.setProperty('--anchor-width', `${anchor.width}px`);
    positioner.style.setProperty('--anchor-height', `${anchor.height}px`);
    const originX = vertical
      ? `${anchor.left + anchor.width / 2 - left}px`
      : `${side === 'right' ? -offset : width + offset}px`;
    const originY = vertical
      ? `${side === 'bottom' ? -offset : height + offset}px`
      : `${anchor.top + anchor.height / 2 - top}px`;
    positioner.style.setProperty('--transform-origin', `${originX} ${originY}`);
    // A logical side is reported as requested, or as its opposite after a flip.
    const logical = requested === 'inline-start' || requested === 'inline-end';
    const flippedLogical = requested === 'inline-start' ? 'inline-end' : 'inline-start';
    const reported = logical ? (side === resolved ? requested : flippedLogical) : side;
    for (const element of [positioner, popup]) {
      element.dataset.side = reported;
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

  // Like the React popover: focus goes to the first focusable element, or to the popup when it
  // opened by touch.
  function open(from: HTMLButtonElement, byTouch: boolean): void {
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
    removeOpen(positioner);
    openPositioners.push(positioner);
    const first = byTouch
      ? undefined
      : [...popup.querySelectorAll<HTMLElement>(tabbable)].find((element) =>
          element.checkVisibility({visibilityProperty: true}),
        );
    (first ?? popup).focus({preventScroll: true});
    ownerDocument.addEventListener('pointerdown', onOutsidePress, true);
    ownerDocument.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
  }

  function close(returnFocus: boolean): void {
    const current = ++change;
    setOpenState(false);
    popup.setAttribute('data-ending-style', '');
    removeListeners();
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
    else open(button, event instanceof PointerEvent && event.pointerType === 'touch');
  }

  function onOutsidePress(event: PointerEvent): void {
    const target = event.target;
    if (!(target instanceof Node) || positioner.contains(target)) return;
    if (triggers.some((button) => button.contains(target))) return;
    close(false);
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    if (openPositioners.at(-1) !== positioner) return;
    event.preventDefault();
    close(true);
  }

  function removeListeners(): void {
    removeOpen(positioner);
    ownerDocument.removeEventListener('pointerdown', onOutsidePress, true);
    ownerDocument.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('resize', place);
    window.removeEventListener('scroll', place, true);
  }

  function onCloseRequest(): void {
    if (isOpen()) close(false);
  }

  for (const button of buttons) button.addEventListener('click', onButtonClick);
  positioner.addEventListener(popoverCloseEvent, onCloseRequest);
  return {
    destroy() {
      // Stops transitions still running from finishing the open or close.
      change++;
      for (const button of buttons) button.removeEventListener('click', onButtonClick);
      positioner.removeEventListener(popoverCloseEvent, onCloseRequest);
      removeListeners();
      // Back to the server-rendered markup: a closed native popover the behavior can attach to again.
      setOpenState(false);
      popup.removeAttribute('data-starting-style');
      popup.removeAttribute('data-ending-style');
      for (const name of ['inset', 'margin', 'top', 'left']) positioner.style.removeProperty(name);
      for (const name of [
        'anchor-width',
        'anchor-height',
        'available-width',
        'available-height',
        'transform-origin',
      ]) {
        positioner.style.removeProperty(`--${name}`);
      }
      for (const element of [positioner, popup]) {
        delete element.dataset.side;
        delete element.dataset.align;
      }
      positioner.popover = 'auto';
    },
  };
}
