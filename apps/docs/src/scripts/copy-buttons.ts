// For `components/static-copy-button.tsx`, with CopyButton's labels and timing.
// Delegated, so it survives page swaps.
import {announce} from '@earendil-works/elanor-react';

const COPIED = 'Copied.';
const ERROR = 'Could not copy. Try again or copy manually.';
const resets = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

function show(button: HTMLElement, state: 'idle' | 'copied' | 'error'): void {
  button.dataset.copyState = state;
  const label = button.getAttribute('aria-label') ?? 'Copy';
  button.title = state === 'copied' ? COPIED : state === 'error' ? ERROR : label;
}

async function copy(button: HTMLElement): Promise<void> {
  clearTimeout(resets.get(button));
  try {
    await navigator.clipboard.writeText(button.dataset.copyValue ?? '');
  } catch {
    show(button, 'error');
    announce(ERROR, button);
    return;
  }
  show(button, 'copied');
  announce(COPIED, button);
  resets.set(
    button,
    setTimeout(() => show(button, 'idle'), 2000),
  );
}

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLElement>('[data-copy-value]');
  if (button && !button.matches(':disabled')) void copy(button);
});
