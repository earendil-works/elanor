import type {Behavior} from '../utils/enhance.ts';

// How long `data-scrolling` stays after the last scroll, when a scroll counts as ended, and the
// smallest thumb, as in the React scroll area.
const scrollingDuration = 500;
const scrollEndDelay = 100;
const minimumThumbSize = 16;

function partsOf(root: HTMLElement): {
  viewport: HTMLElement;
  scrollbar: HTMLElement;
  thumb: HTMLElement;
} {
  const viewport = root.firstElementChild;
  const scrollbar = root.querySelector(':scope > [data-orientation="vertical"]');
  const thumb = scrollbar?.firstElementChild;
  if (
    !(viewport instanceof HTMLElement) ||
    !(scrollbar instanceof HTMLElement) ||
    !(thumb instanceof HTMLElement)
  ) {
    throw new Error('ScrollArea.StaticRoot needs a StaticViewport and a StaticScrollbar.');
  }
  return {viewport, scrollbar, thumb};
}

/** Drives a server-rendered `ScrollArea.StaticRoot`'s scrollbar without React. */
export function createScrollArea(root: HTMLElement): Behavior {
  const {viewport, scrollbar, thumb} = partsOf(root);
  let thumbSize = 0;
  let trackSize = 0;
  let scrollingTimer: ReturnType<typeof setTimeout> | undefined;
  let scrollEndTimer: ReturnType<typeof setTimeout> | undefined;
  // Only the reader's scrolling shows `data-scrolling`, not scrolls the page makes itself.
  let readerScrolling = false;
  let drag: {pointerY: number; scrollTop: number} | null = null;

  function toggle(name: string, on: boolean, elements: HTMLElement[]): void {
    for (const element of elements) element.toggleAttribute(name, on);
  }

  function maxScroll(): number {
    return viewport.scrollHeight - viewport.clientHeight;
  }

  function update(): void {
    const max = maxScroll();
    const overflows = max > 0;
    const parts = [root, viewport, scrollbar];
    toggle('data-has-overflow-y', overflows, parts);
    toggle('data-overflow-y-start', overflows && viewport.scrollTop > 0, parts);
    toggle('data-overflow-y-end', overflows && viewport.scrollTop < max, parts);
    scrollbar.style.display = overflows ? '' : 'none';
    viewport.tabIndex = overflows ? 0 : -1;
    if (!overflows) return;
    const style = getComputedStyle(scrollbar);
    trackSize =
      scrollbar.clientHeight -
      Number.parseFloat(style.paddingTop) -
      Number.parseFloat(style.paddingBottom);
    thumbSize = Math.max(
      minimumThumbSize,
      (trackSize * viewport.clientHeight) / viewport.scrollHeight,
    );
    const offset = ((trackSize - thumbSize) * viewport.scrollTop) / max;
    scrollbar.style.setProperty('--scroll-area-thumb-height', `${thumbSize}px`);
    thumb.style.transform = `translate3d(0, ${offset}px, 0)`;
  }

  function onReaderInput(): void {
    readerScrolling = true;
  }

  function onScroll(): void {
    update();
    clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(() => (readerScrolling = false), scrollEndDelay);
    if (!readerScrolling) return;
    toggle('data-scrolling', true, [root, scrollbar, thumb]);
    clearTimeout(scrollingTimer);
    scrollingTimer = setTimeout(
      () => toggle('data-scrolling', false, [root, scrollbar, thumb]),
      scrollingDuration,
    );
  }

  function scrollPerPixel(): number {
    return maxScroll() / Math.max(trackSize - thumbSize, 1);
  }

  function onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    event.preventDefault();
    readerScrolling = true;
    if (event.target !== thumb) {
      // Pressing the track centers the thumb on the pointer.
      const trackTop =
        scrollbar.getBoundingClientRect().top +
        Number.parseFloat(getComputedStyle(scrollbar).paddingTop);
      viewport.scrollTop = (event.clientY - trackTop - thumbSize / 2) * scrollPerPixel();
    }
    drag = {pointerY: event.clientY, scrollTop: viewport.scrollTop};
    scrollbar.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent): void {
    if (!drag) return;
    viewport.scrollTop = drag.scrollTop + (event.clientY - drag.pointerY) * scrollPerPixel();
  }

  function onPointerUp(event: PointerEvent): void {
    drag = null;
    if (scrollbar.hasPointerCapture(event.pointerId)) {
      scrollbar.releasePointerCapture(event.pointerId);
    }
  }

  function onPointerEnter(): void {
    scrollbar.toggleAttribute('data-hovering', true);
  }

  function onPointerLeave(): void {
    scrollbar.toggleAttribute('data-hovering', false);
  }

  const resizeObserver = new ResizeObserver(update);
  resizeObserver.observe(viewport);
  for (const child of viewport.children) resizeObserver.observe(child);

  const readerInputs = ['wheel', 'touchmove', 'pointermove', 'pointerenter', 'keydown'];
  for (const type of readerInputs) {
    viewport.addEventListener(type, onReaderInput, {passive: true});
  }
  viewport.addEventListener('scroll', onScroll, {passive: true});
  scrollbar.addEventListener('pointerdown', onPointerDown);
  scrollbar.addEventListener('pointermove', onPointerMove);
  scrollbar.addEventListener('pointerup', onPointerUp);
  scrollbar.addEventListener('pointercancel', onPointerUp);
  root.addEventListener('pointerenter', onPointerEnter);
  root.addEventListener('pointerleave', onPointerLeave);
  viewport.toggleAttribute('data-native-scrollbar-hidden', true);
  update();

  return {
    destroy() {
      clearTimeout(scrollingTimer);
      clearTimeout(scrollEndTimer);
      resizeObserver.disconnect();
      for (const type of readerInputs) viewport.removeEventListener(type, onReaderInput);
      viewport.removeEventListener('scroll', onScroll);
      scrollbar.removeEventListener('pointerdown', onPointerDown);
      scrollbar.removeEventListener('pointermove', onPointerMove);
      scrollbar.removeEventListener('pointerup', onPointerUp);
      scrollbar.removeEventListener('pointercancel', onPointerUp);
      root.removeEventListener('pointerenter', onPointerEnter);
      root.removeEventListener('pointerleave', onPointerLeave);
      viewport.removeAttribute('data-native-scrollbar-hidden');
    },
  };
}
