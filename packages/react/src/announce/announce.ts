export type AnnouncePriority = 'polite' | 'assertive';

const pending = new WeakMap<Element, ReturnType<typeof setTimeout>>();

/**
 * Announces `message` to screen readers without moving focus. `from` picks the document and the
 * open modal dialog it is in, if any. A newer message replaces one not yet read. `priority`
 * defaults to `polite`.
 */
export function announce(
  message: string,
  from: Element,
  priority: AnnouncePriority = 'polite',
): void {
  if (!message) return;
  const region = liveRegion(from, priority);
  clearTimeout(pending.get(region));
  region.textContent = '';
  // Delayed so screen readers notice a new or just-cleared region, and a repeat is read again.
  pending.set(
    region,
    setTimeout(() => {
      // Looked up again: the modal dialog may have closed. A region created here may go unheard.
      const current = liveRegion(from, priority);
      current.textContent = message;
      pending.set(
        current,
        setTimeout(() => {
          if (current.textContent === message) current.textContent = '';
        }, 5000),
      );
    }, 200),
  );
}

function liveRegion(from: Element, priority: AnnouncePriority): HTMLElement {
  const document = from.ownerDocument;
  // An open modal dialog hides everything outside it, live regions included.
  const container = from.closest('dialog:modal') ?? document.body;
  // Found by attribute, so separately bundled copies share one region.
  const existing = container.querySelector<HTMLElement>(
    `:scope > [data-elanor-announcer="${priority}"]`,
  );
  if (existing) return existing;
  const region = document.createElement('div');
  region.setAttribute('role', priority === 'polite' ? 'status' : 'alert');
  // Base UI's modals keep only `[aria-live]` elements outside them audible.
  region.setAttribute('aria-live', priority);
  region.setAttribute('aria-atomic', 'true');
  region.dataset.elanorAnnouncer = priority;
  // Inline, so it works without Elanor's CSS.
  region.style.cssText =
    'position: fixed; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap';
  container.append(region);
  return region;
}
