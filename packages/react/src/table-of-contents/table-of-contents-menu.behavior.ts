import {popoverCloseEvent} from '../popover/popover.behavior.ts';
import type {Behavior} from '../utils/enhance.ts';
import {tableOfContentsChangeEvent} from './table-of-contents.behavior.ts';

// How far content scrolls beneath the bar until its shadow is fully shown, as in the React menu.
const shadowFadeDistance = 32;

// The element the bar sticks within, like `position: sticky` uses, or `null` for the document.
function scrollContainerOf(element: HTMLElement): HTMLElement | null {
  const ownerDocument = element.ownerDocument;
  for (let node = element.parentElement; node; node = node.parentElement) {
    if (node === ownerDocument.body || node === ownerDocument.documentElement) return null;
    if (/auto|scroll|overlay|hidden/.test(getComputedStyle(node).overflowY)) return node;
  }
  return null;
}

/**
 * Runs a server-rendered `TableOfContents.StaticMenu` without React: shows the current section in
 * the trigger, closes the list when a link is chosen or the page scrolls, and fades the bar's
 * shadow in as content scrolls beneath it (`--sticky-progress`). The list opens and closes with
 * `createPopover`, and its entries follow the page with `createTableOfContents`.
 */
export function createTableOfContentsMenu(bar: HTMLElement): Behavior {
  const value = bar.querySelector('[data-elanor-table-of-contents-value]');
  const positioner = bar.querySelector<HTMLElement>('[popover]');
  const container = scrollContainerOf(bar);
  const scrollTarget = container ?? window;
  let restingTop = 0;
  let stickyTop = 0;
  let frame = 0;

  function scrollTop(): number {
    return container ? container.scrollTop : window.scrollY;
  }

  function closeList(): void {
    positioner?.dispatchEvent(new Event(popoverCloseEvent));
  }

  function onChange(event: Event): void {
    if (value && event instanceof CustomEvent && event.detail instanceof HTMLElement) {
      value.textContent = event.detail.textContent;
    }
  }

  function onListClick(event: MouseEvent): void {
    if (event.target instanceof Element && event.target.closest('a[href]')) closeList();
  }

  function updateShadow(): void {
    frame = 0;
    const progress = (scrollTop() + stickyTop - restingTop) / shadowFadeDistance;
    bar.style.setProperty('--sticky-progress', String(Math.min(Math.max(progress, 0), 1)));
  }

  // The resting position only changes with the layout; measure it with sticking turned off.
  function measure(): void {
    const position = bar.style.position;
    bar.style.position = 'static';
    const containerTop = container
      ? container.getBoundingClientRect().top + container.clientTop
      : 0;
    restingTop = bar.getBoundingClientRect().top - containerTop + scrollTop();
    bar.style.position = position;
    stickyTop = Number.parseFloat(getComputedStyle(bar).insetBlockStart) || 0;
    updateShadow();
  }

  function onScroll(): void {
    closeList();
    if (!frame) frame = requestAnimationFrame(updateShadow);
  }

  // Re-measure when the content around the bar changes size: the document's body, or the
  // container and what it holds, since a scroller keeps its own size as its content grows,
  // including children added later.
  const resizeObserver = new ResizeObserver(measure);
  const childObserver = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof Element) resizeObserver.observe(node);
      }
    }
    measure();
  });
  if (container) {
    for (const element of [container, ...container.children]) resizeObserver.observe(element);
    childObserver.observe(container, {childList: true});
  } else {
    resizeObserver.observe(bar.ownerDocument.body);
  }
  bar.addEventListener(tableOfContentsChangeEvent, onChange);
  positioner?.addEventListener('click', onListClick);
  scrollTarget.addEventListener('scroll', onScroll, {passive: true});
  measure();
  return {
    destroy() {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      childObserver.disconnect();
      bar.removeEventListener(tableOfContentsChangeEvent, onChange);
      positioner?.removeEventListener('click', onListClick);
      scrollTarget.removeEventListener('scroll', onScroll);
    },
  };
}
