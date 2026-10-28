// The docs search's own behavior, on Elanor's static search dialog: opens it from the keyboard
// (⌘K on Apple platforms, Ctrl+K elsewhere, and `/` outside text fields; Elanor leaves shortcuts
// to the page), names the shortcut on the dialog's triggers (`aria-keyshortcuts`) and shows the
// platform's modifier key. Enter without results submits the search form, which has nowhere to
// go, so that stays on the page.
import type {Behavior} from '@earendil-works/elanor-react';

function isApplePlatform(): boolean {
  const platform =
    (navigator as Navigator & {userAgentData?: {platform: string}}).userAgentData?.platform ??
    navigator.platform;
  return /^(mac|iphone|ipad|ipod)/i.test(platform);
}

export function createDocsSearch(element: HTMLElement): Behavior {
  if (!(element instanceof HTMLDialogElement)) return {destroy() {}};
  const dialog = element;
  const apple = isApplePlatform();
  const triggers = () =>
    document.querySelectorAll<HTMLElement>(`[commandfor="${dialog.id}"][command="show-modal"]`);

  for (const trigger of triggers()) {
    trigger.setAttribute('aria-keyshortcuts', apple ? 'Meta+K' : 'Control+K');
    const modifier = trigger.querySelector('[data-docs-shortcut-modifier]');
    if (modifier) modifier.textContent = apple ? '⌘' : 'Ctrl';
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (event.defaultPrevented || event.isComposing || event.altKey || event.shiftKey) return;
    const target = event.target;
    const shortcut =
      event.key.toLowerCase() === 'k' &&
      (apple ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey);
    const slash =
      event.key === '/' &&
      !event.metaKey &&
      !event.ctrlKey &&
      !(target instanceof Element && target.closest('input, textarea, select, [contenteditable]'));
    if (!shortcut && !slash) return;
    event.preventDefault();
    // A visible trigger's click lets Elanor's modal behavior open and animate the dialog.
    if (dialog.open) return;
    const all = [...triggers()];
    (all.find((trigger) => trigger.getClientRects().length) ?? all[0])?.click();
  }

  function onSubmit(event: SubmitEvent): void {
    event.preventDefault();
  }

  document.addEventListener('keydown', onKeyDown);
  dialog.addEventListener('submit', onSubmit);
  return {
    destroy() {
      document.removeEventListener('keydown', onKeyDown);
      dialog.removeEventListener('submit', onSubmit);
    },
  };
}
