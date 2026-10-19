/*
 * Swipe back a page in a Drawer.Stack, like a phone's navigation stack: the top page follows the finger towards the
 * inline end (right, or left in right-to-left layouts), completes past a share of the width or with a flick, and
 * otherwise springs back; pulling the other way meets a stiff rubber band. Dragging a bottom sheet down to close it is
 * sheet-drag.ts's, which leaves horizontal moves alone. Touches on content that scrolls sideways itself (code, a diff)
 * or inside `data-base-ui-swipe-ignore` are left to it.
 */

import {rubberBand} from './sheet-drag.ts';

/** A swipe completes past this share of the width, or faster than this (px/ms). */
const BACK_DISTANCE = 0.4;
const BACK_VELOCITY = 0.45;
/** Rubber band of a pull towards the inline start. */
const OVERPULL_RESISTANCE = 0.15;
/** Movement (px) before a touch is read as horizontal or vertical. */
const SLOP = 8;
/** Without a move this long (ms) before release, the finger was still: no flick. */
const STILL = 100;

const IGNORE_SELECTOR = '[data-base-ui-swipe-ignore]';

export interface SwipeBackOptions {
  /** The stack's element: touches outside it are not swipes. */
  stack: HTMLElement;
  /** Whether there is a page to go back to. */
  canGoBack: () => boolean;
  /** The top page's offset (px towards the inline end) while swiping. */
  swipe: (offset: number) => void;
  /** Released: `back` past the threshold or with a flick. */
  swipeEnd: (back: boolean) => void;
}

interface Gesture {
  x: number;
  y: number;
  time: number;
  velocity: number;
  distance: number;
  /** 1 in left-to-right layouts, -1 in right-to-left ones. */
  sign: number;
  axis?: 'x' | 'none';
  /** Whether the touch started on content that handles sideways moves itself. */
  sideways: boolean;
}

/** Whether a touch starts on something that scrolls sideways itself or asks to be left alone. */
function handlesSideways(target: EventTarget | null, stack: HTMLElement): boolean {
  if (!(target instanceof Element) || !stack.contains(target)) {
    return true;
  }
  const ignored = target.closest(IGNORE_SELECTOR);
  if (ignored && ignored !== stack && stack.contains(ignored)) {
    return true;
  }
  for (
    let element: Element | null = target;
    element && element !== stack;
    element = element.parentElement
  ) {
    if (
      element.scrollWidth > element.clientWidth + 1 &&
      getComputedStyle(element).overflowX !== 'hidden'
    ) {
      return true;
    }
  }
  return false;
}

/** Attaches swipe back to `popup`; returns the cleanup. */
export function attachSwipeBack(popup: HTMLElement, options: SwipeBackOptions): () => void {
  const {stack, canGoBack, swipe, swipeEnd} = options;
  let gesture: Gesture | undefined;

  const start = (event: TouchEvent) => {
    const touch = event.touches[0];
    gesture =
      touch && event.touches.length === 1 && canGoBack()
        ? {
            x: touch.clientX,
            y: touch.clientY,
            time: event.timeStamp,
            velocity: 0,
            distance: 0,
            sign: getComputedStyle(stack).direction === 'rtl' ? -1 : 1,
            sideways: handlesSideways(event.target, stack),
          }
        : undefined;
  };

  const move = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!gesture || !touch) {
      return;
    }
    const distance = gesture.sign * (touch.clientX - gesture.x);
    if (!gesture.axis) {
      const dy = touch.clientY - gesture.y;
      if (Math.abs(distance) < SLOP && Math.abs(dy) < SLOP) {
        return;
      }
      gesture.axis = Math.abs(distance) > Math.abs(dy) && !gesture.sideways ? 'x' : 'none';
    }
    if (gesture.axis !== 'x') {
      return;
    }
    if (event.cancelable) {
      event.preventDefault();
    }
    const elapsed = Math.max(1, event.timeStamp - gesture.time);
    gesture.velocity = 0.8 * ((distance - gesture.distance) / elapsed) + 0.2 * gesture.velocity;
    gesture.distance = distance;
    gesture.time = event.timeStamp;
    swipe(distance >= 0 ? distance : rubberBand(distance, stack.clientWidth, OVERPULL_RESISTANCE));
  };

  const end = (event: TouchEvent) => {
    const done = gesture;
    gesture = undefined;
    if (done?.axis !== 'x') {
      return;
    }
    const velocity = event.timeStamp - done.time > STILL ? 0 : done.velocity;
    const width = stack.clientWidth || 1;
    swipeEnd(done.distance / width > BACK_DISTANCE || velocity > BACK_VELOCITY);
  };

  const listenerOptions = {passive: false};
  popup.addEventListener('touchstart', start, listenerOptions);
  popup.addEventListener('touchmove', move, listenerOptions);
  popup.addEventListener('touchend', end);
  popup.addEventListener('touchcancel', end);
  return () => {
    popup.removeEventListener('touchstart', start);
    popup.removeEventListener('touchmove', move);
    popup.removeEventListener('touchend', end);
    popup.removeEventListener('touchcancel', end);
  };
}
