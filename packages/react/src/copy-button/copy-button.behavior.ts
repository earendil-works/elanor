// The copy button's behavior, without React, for pages rendered on the server. The React
// component copies in its own click handler and shares the timing and default labels from here.
//
// Markup, as `CopyButton` renders it:
// - a button with `data-elanor="copy-button"`, `data-copy-state="idle"`, and the text to copy in
//   `data-elanor-copy-value` (only for a string `value`; a function can't be written to HTML);
// - the feedback in `data-elanor-copied-label` and `data-elanor-error-label`;
// - a `role="status"` element right after the button.
//
// Like the component, a copy sets `data-copy-state` to `copied`, back to `idle` after two seconds,
// or to `error`, and shows the feedback in the button's `title` and the status element. The
// stylesheet swaps the icons by `data-copy-state`.

import type {Behavior} from '../utils/enhance.ts';

/** How long the copied state lasts, in milliseconds. */
export const copiedStateDuration = 2000;
export const defaultCopiedLabel = 'Copied.';
export const defaultErrorLabel = 'Could not copy. Try again or copy manually.';

type CopyState = 'idle' | 'copied' | 'error';

/** Copies the button's value when it is pressed and reports the result. */
export function createCopyButton(button: HTMLElement): Behavior {
  const status =
    button.nextElementSibling?.getAttribute('role') === 'status' ? button.nextElementSibling : null;
  const title = button.getAttribute('title');
  let resetTimer: ReturnType<typeof setTimeout> | undefined;

  function setState(state: CopyState): void {
    clearTimeout(resetTimer);
    const feedback =
      state === 'copied'
        ? (button.dataset.elanorCopiedLabel ?? defaultCopiedLabel)
        : state === 'error'
          ? (button.dataset.elanorErrorLabel ?? defaultErrorLabel)
          : '';
    button.dataset.copyState = state;
    if (feedback) button.setAttribute('title', feedback);
    else if (title === null) button.removeAttribute('title');
    else button.setAttribute('title', title);
    if (status) status.textContent = feedback;
    if (state === 'copied') resetTimer = setTimeout(() => setState('idle'), copiedStateDuration);
  }

  async function copy(value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      setState('error');
      return;
    }
    setState('copied');
  }

  function onClick(event: MouseEvent): void {
    const value = button.dataset.elanorCopyValue;
    if (event.defaultPrevented || button.matches(':disabled') || value === undefined) return;
    void copy(value);
  }

  button.addEventListener('click', onClick);
  return {
    destroy() {
      clearTimeout(resetTimer);
      button.removeEventListener('click', onClick);
    },
  };
}
