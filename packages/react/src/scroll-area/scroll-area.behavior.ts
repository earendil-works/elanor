import type {Behavior} from '../utils/enhance.ts';

// How long `data-scrolling` stays after the last scroll, when a scroll counts as ended, and the
// smallest thumb, as in the React scroll area.
const scrollingDuration = 500;
const scrollEndDelay = 100;
const minimumThumbSize = 16;

type Orientation = 'vertical' | 'horizontal';

interface Axis {
  readonly orientation: Orientation;
  readonly scrollbar: HTMLElement;
  readonly thumb: HTMLElement;
  thumbSize: number;
  trackSize: number;
}

function partsOf(root: HTMLElement): {
  viewport: HTMLElement;
  axes: Axis[];
  corner: HTMLElement | null;
} {
  const viewport = root.firstElementChild;
  if (!(viewport instanceof HTMLElement)) {
    throw new Error('ScrollArea.StaticRoot needs a StaticViewport.');
  }
  const axes = (['vertical', 'horizontal'] as const).flatMap((orientation): Axis[] => {
    const scrollbar = root.querySelector(`:scope > [data-orientation="${orientation}"]`);
    const thumb = scrollbar?.firstElementChild;
    if (!(scrollbar instanceof HTMLElement) || !(thumb instanceof HTMLElement)) return [];
    return [{orientation, scrollbar, thumb, thumbSize: 0, trackSize: 0}];
  });
  const corner = root.querySelector<HTMLElement>(':scope > [data-elanor-scroll-area-corner]');
  return {viewport, axes, corner};
}

/** Drives a server-rendered `ScrollArea.StaticRoot`'s scrollbars without React. */
export function createScrollArea(root: HTMLElement): Behavior {
  const {viewport, axes, corner} = partsOf(root);
  let scrollingTimer: ReturnType<typeof setTimeout> | undefined;
  let scrollEndTimer: ReturnType<typeof setTimeout> | undefined;
  // Only the reader's scrolling shows `data-scrolling`, not scrolls the page makes itself.
  let readerScrolling = false;
  let drag: {axis: Axis; pointer: number; scroll: number} | null = null;

  const vertical = (axis: Axis): boolean => axis.orientation === 'vertical';
  const rtl = (): boolean => getComputedStyle(viewport).direction === 'rtl';

  function maxScroll(axis: Axis): number {
    return vertical(axis)
      ? viewport.scrollHeight - viewport.clientHeight
      : viewport.scrollWidth - viewport.clientWidth;
  }

  // How far the viewport has scrolled from its start; in right-to-left, `scrollLeft` is negative.
  function scrolled(axis: Axis): number {
    return vertical(axis) ? viewport.scrollTop : Math.abs(viewport.scrollLeft);
  }

  function toggle(name: string, on: boolean, elements: HTMLElement[]): void {
    for (const element of elements) element.toggleAttribute(name, on);
  }

  function updateAxis(axis: Axis): boolean {
    const max = maxScroll(axis);
    const overflows = max > 0;
    const letter = vertical(axis) ? 'y' : 'x';
    const parts = [root, viewport, axis.scrollbar];
    toggle(`data-has-overflow-${letter}`, overflows, parts);
    toggle(`data-overflow-${letter}-start`, overflows && scrolled(axis) > 0, parts);
    toggle(`data-overflow-${letter}-end`, overflows && scrolled(axis) < max - 1, parts);
    axis.scrollbar.style.display = overflows ? '' : 'none';
    if (!overflows) return false;
    const style = getComputedStyle(axis.scrollbar);
    const size = vertical(axis) ? viewport.clientHeight : viewport.clientWidth;
    const scrollSize = vertical(axis) ? viewport.scrollHeight : viewport.scrollWidth;
    axis.trackSize = vertical(axis)
      ? axis.scrollbar.clientHeight -
        Number.parseFloat(style.paddingTop) -
        Number.parseFloat(style.paddingBottom)
      : axis.scrollbar.clientWidth -
        Number.parseFloat(style.paddingLeft) -
        Number.parseFloat(style.paddingRight);
    axis.thumbSize = Math.max(minimumThumbSize, (axis.trackSize * size) / scrollSize);
    const room = axis.trackSize - axis.thumbSize;
    const progress = scrolled(axis) / max;
    if (vertical(axis)) {
      axis.scrollbar.style.setProperty('--scroll-area-thumb-height', `${axis.thumbSize}px`);
      axis.thumb.style.transform = `translate3d(0, ${room * progress}px, 0)`;
    } else {
      axis.scrollbar.style.setProperty('--scroll-area-thumb-width', `${axis.thumbSize}px`);
      // In right-to-left, the thumb already starts at the right and moves left.
      const offset = rtl() ? -room * progress : room * progress;
      axis.thumb.style.transform = `translate3d(${offset}px, 0, 0)`;
    }
    return true;
  }

  function update(): void {
    const shown = axes.map(updateAxis);
    const both = axes.length === 2 && shown.every(Boolean);
    const verticalBar = axes.find(vertical)?.scrollbar;
    const horizontalBar = axes.find((axis) => !vertical(axis))?.scrollbar;
    root.style.setProperty(
      '--scroll-area-corner-width',
      `${both ? verticalBar?.offsetWidth : 0}px`,
    );
    root.style.setProperty(
      '--scroll-area-corner-height',
      `${both ? horizontalBar?.offsetHeight : 0}px`,
    );
    if (corner) corner.style.display = both ? '' : 'none';
    viewport.tabIndex = shown.some(Boolean) ? 0 : -1;
  }

  function onReaderInput(): void {
    readerScrolling = true;
  }

  function onScroll(): void {
    update();
    clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(() => (readerScrolling = false), scrollEndDelay);
    if (!readerScrolling) return;
    const parts = [root, ...axes.flatMap((axis) => [axis.scrollbar, axis.thumb])];
    toggle('data-scrolling', true, parts);
    clearTimeout(scrollingTimer);
    scrollingTimer = setTimeout(() => toggle('data-scrolling', false, parts), scrollingDuration);
  }

  function scrollPerPixel(axis: Axis): number {
    return maxScroll(axis) / Math.max(axis.trackSize - axis.thumbSize, 1);
  }

  function axisOf(event: Event): Axis | undefined {
    return axes.find((axis) => axis.scrollbar === event.currentTarget);
  }

  function scrollTo(axis: Axis, value: number): void {
    if (vertical(axis)) viewport.scrollTop = value;
    else viewport.scrollLeft = value;
  }

  function onPointerDown(event: PointerEvent): void {
    const axis = axisOf(event);
    if (!axis || event.button !== 0) return;
    event.preventDefault();
    readerScrolling = true;
    if (event.target !== axis.thumb) {
      // Pressing the track centers the thumb on the pointer.
      const box = axis.scrollbar.getBoundingClientRect();
      const style = getComputedStyle(axis.scrollbar);
      const start = vertical(axis)
        ? box.top + Number.parseFloat(style.paddingTop)
        : box.left + Number.parseFloat(style.paddingLeft);
      const offset = (vertical(axis) ? event.clientY : event.clientX) - start - axis.thumbSize / 2;
      const room = axis.trackSize - axis.thumbSize;
      const distance = !vertical(axis) && rtl() ? -(room - offset) : offset;
      scrollTo(axis, distance * scrollPerPixel(axis));
    }
    drag = {
      axis,
      pointer: vertical(axis) ? event.clientY : event.clientX,
      scroll: vertical(axis) ? viewport.scrollTop : viewport.scrollLeft,
    };
    axis.scrollbar.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent): void {
    if (!drag) return;
    const pointer = vertical(drag.axis) ? event.clientY : event.clientX;
    scrollTo(drag.axis, drag.scroll + (pointer - drag.pointer) * scrollPerPixel(drag.axis));
  }

  function onPointerUp(event: PointerEvent): void {
    drag = null;
    const axis = axisOf(event);
    if (axis?.scrollbar.hasPointerCapture(event.pointerId)) {
      axis.scrollbar.releasePointerCapture(event.pointerId);
    }
  }

  function onPointerEnter(): void {
    for (const axis of axes) axis.scrollbar.toggleAttribute('data-hovering', true);
  }

  function onPointerLeave(): void {
    for (const axis of axes) axis.scrollbar.toggleAttribute('data-hovering', false);
  }

  const resizeObserver = new ResizeObserver(update);
  resizeObserver.observe(viewport);
  for (const child of viewport.children) resizeObserver.observe(child);

  const readerInputs = ['wheel', 'touchmove', 'pointermove', 'pointerenter', 'keydown'];
  for (const type of readerInputs) {
    viewport.addEventListener(type, onReaderInput, {passive: true});
  }
  viewport.addEventListener('scroll', onScroll, {passive: true});
  for (const axis of axes) {
    axis.scrollbar.addEventListener('pointerdown', onPointerDown);
    axis.scrollbar.addEventListener('pointermove', onPointerMove);
    axis.scrollbar.addEventListener('pointerup', onPointerUp);
    axis.scrollbar.addEventListener('pointercancel', onPointerUp);
  }
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
      for (const axis of axes) {
        axis.scrollbar.removeEventListener('pointerdown', onPointerDown);
        axis.scrollbar.removeEventListener('pointermove', onPointerMove);
        axis.scrollbar.removeEventListener('pointerup', onPointerUp);
        axis.scrollbar.removeEventListener('pointercancel', onPointerUp);
      }
      root.removeEventListener('pointerenter', onPointerEnter);
      root.removeEventListener('pointerleave', onPointerLeave);
      viewport.removeAttribute('data-native-scrollbar-hidden');
    },
  };
}
