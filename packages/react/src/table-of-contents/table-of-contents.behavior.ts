import type {Behavior} from '../utils/enhance.ts';

/** Event a static table of contents dispatches, bubbling, when its active link changes. */
export const tableOfContentsChangeEvent = 'elanor:table-of-contents-change';

interface Entry {
  readonly link: HTMLAnchorElement;
  readonly heading: HTMLElement;
}

// The ancestor the headings scroll in, or `null` for the document. Only one that overflows counts:
// `overflow-x: hidden` alone turns `overflow-y` into `auto` on wrappers that never scroll.
function scrollerOf(element: HTMLElement): HTMLElement | null {
  const ownerDocument = element.ownerDocument;
  for (let node = element.parentElement; node; node = node.parentElement) {
    if (node === ownerDocument.body || node === ownerDocument.documentElement) return null;
    if (
      /auto|scroll|overlay/.test(getComputedStyle(node).overflowY) &&
      node.scrollHeight > node.clientHeight
    ) {
      return node;
    }
  }
  return null;
}

/**
 * Marks the link of the section in view in a server-rendered `TableOfContents.StaticRoot`, and
 * moves its `Indicator` there. A section is in view once its heading reaches the
 * `scroll-padding-top` of the headings' scroll container, the document or a scrolling ancestor;
 * at the end of it, the last one is. Dispatches
 * `tableOfContentsChangeEvent` with the link as `detail`.
 */
export function createTableOfContents(root: HTMLElement): Behavior {
  const ownerDocument = root.ownerDocument;
  const entries = [...root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')].flatMap(
    (link): Entry[] => {
      const heading = ownerDocument.getElementById(decodeURIComponent(link.hash.slice(1)));
      return heading ? [{link, heading}] : [];
    },
  );
  const indicator = root.querySelector<HTMLElement>(':scope > [role="presentation"]');
  let active: Entry | undefined;
  let frame = 0;

  function placeIndicator(): void {
    if (!indicator || !active) return;
    const rootBox = root.getBoundingClientRect();
    const linkBox = active.link.getBoundingClientRect();
    if (linkBox.height === 0) {
      indicator.hidden = true;
      return;
    }
    indicator.style.setProperty(
      '--active-entry-top',
      `${linkBox.top - rootBox.top + root.scrollTop}px`,
    );
    indicator.style.setProperty('--active-entry-height', `${linkBox.height}px`);
    indicator.hidden = false;
  }

  function setActive(entry: Entry | undefined): void {
    if (!entry || entry === active) return;
    for (const link of root.querySelectorAll('a[data-active]')) {
      link.removeAttribute('data-active');
      link.removeAttribute('aria-current');
    }
    active = entry;
    active.link.setAttribute('data-active', '');
    active.link.setAttribute('aria-current', 'location');
    placeIndicator();
    root.dispatchEvent(
      new CustomEvent(tableOfContentsChangeEvent, {bubbles: true, detail: active.link}),
    );
  }

  function update(): void {
    frame = 0;
    const first = entries[0];
    if (!first) return;
    const scroller = scrollerOf(first.heading);
    const page = ownerDocument.documentElement;
    const atEnd = scroller
      ? scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1
      : window.innerHeight + window.scrollY >= page.scrollHeight - 1;
    if (atEnd) {
      setActive(entries.at(-1));
      return;
    }
    const scrollerTop = scroller ? scroller.getBoundingClientRect().top + scroller.clientTop : 0;
    const padding = Number.parseFloat(getComputedStyle(scroller ?? page).scrollPaddingTop) || 0;
    const offset = scrollerTop + padding;
    let current = first;
    for (const entry of entries) {
      // A few pixels of slack: jumping to a heading can land it just below the padding.
      if (entry.heading.getBoundingClientRect().top - offset > 4) break;
      current = entry;
    }
    setActive(current);
  }

  function scheduleUpdate(): void {
    if (!frame) frame = requestAnimationFrame(update);
  }

  const resizeObserver = new ResizeObserver(placeIndicator);
  resizeObserver.observe(root);
  // Captured, so scrolling in an ancestor of the headings counts too.
  window.addEventListener('scroll', scheduleUpdate, {capture: true, passive: true});
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('hashchange', scheduleUpdate);
  update();
  return {
    destroy() {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', scheduleUpdate, {capture: true});
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('hashchange', scheduleUpdate);
    },
  };
}
