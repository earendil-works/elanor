import type {Behavior} from '../utils/enhance.ts';

type CopyState = 'idle' | 'copied' | 'error';

/**
 * Makes a server-rendered `CopyButton` copy without React. It reads the markup `CopyButton`
 * renders: the value in `data-elanor-copy-value` (only a string `value` is rendered), the labels in
 * `data-elanor-copied-label` and `data-elanor-error-label`, and the `role="status"` element after
 * the button. Like the component, it sets `data-copy-state` to `copied`, back to `idle` after
 * `semantic.duration.confirmation`, or `error`, and shows the feedback in the button's `title` and the status element.
 */
export function createCopyButton(button: HTMLElement): Behavior {
  const status =
    button.nextElementSibling?.getAttribute('role') === 'status' ? button.nextElementSibling : null;
  const title = button.getAttribute('title');
  let resetTimer: ReturnType<typeof setTimeout> | undefined;

  function setState(state: CopyState): void {
    clearTimeout(resetTimer);
    const feedback =
      state === 'copied'
        ? (button.dataset.elanorCopiedLabel ?? '')
        : state === 'error'
          ? (button.dataset.elanorErrorLabel ?? '')
          : '';
    button.dataset.copyState = state;
    if (feedback) button.setAttribute('title', feedback);
    else if (title === null) button.removeAttribute('title');
    else button.setAttribute('title', title);
    if (status) status.textContent = feedback;
    if (state === 'copied') {
      // `semantic.duration.confirmation`, in ms; 2000 when the tokens aren't loaded.
      const duration =
        Number.parseFloat(
          getComputedStyle(button).getPropertyValue('--semantic-duration-confirmation'),
        ) || 2000;
      resetTimer = setTimeout(() => setState('idle'), duration);
    }
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
