// Copies a docs page's Markdown: the "Copy page" button names it in `data-docs-copy-page`. The
// clipboard gets a `ClipboardItem` holding the fetch's promise, which Safari accepts after the
// click. Like Elanor's copy button, the button's `data-copy-state` becomes `copied` (back to `idle`
// after `semantic.duration.confirmation`) or `error`, and the status element after it announces
// `data-docs-copied-label` or `data-docs-error-label`.
import type {Behavior} from '@earendil-works/elanor-react';

async function fetchMarkdown(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not fetch ${url}: ${response.status}`);
  return new Blob([await response.text()], {type: 'text/plain'});
}

export function createCopyPage(button: HTMLElement): Behavior {
  const status =
    button.nextElementSibling?.getAttribute('role') === 'status' ? button.nextElementSibling : null;
  let resetTimer: ReturnType<typeof setTimeout> | undefined;

  function setState(state: 'idle' | 'copied' | 'error'): void {
    clearTimeout(resetTimer);
    button.dataset.copyState = state;
    const label =
      state === 'copied'
        ? button.dataset.docsCopiedLabel
        : state === 'error'
          ? button.dataset.docsErrorLabel
          : '';
    if (status) status.textContent = label ?? '';
    if (state === 'copied') {
      // Minified CSS may write the token in seconds.
      const token = getComputedStyle(button).getPropertyValue('--semantic-duration-confirmation');
      const duration = Number.parseFloat(token) * (token.trim().endsWith('ms') ? 1 : 1000) || 2000;
      resetTimer = setTimeout(() => setState('idle'), duration);
    }
  }

  async function onClick(): Promise<void> {
    const url = button.dataset.docsCopyPage ?? '';
    try {
      await navigator.clipboard.write([new ClipboardItem({'text/plain': fetchMarkdown(url)})]);
    } catch {
      setState('error');
      return;
    }
    setState('copied');
  }

  button.addEventListener('click', onClick);
  return {
    destroy() {
      clearTimeout(resetTimer);
      button.removeEventListener('click', onClick);
    },
  };
}
