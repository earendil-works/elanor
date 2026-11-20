import {announce} from '../announce/announce.ts';
import type {Behavior} from '../utils/enhance.ts';

type CopyState = 'idle' | 'copied' | 'error';

/**
 * Makes a server-rendered `CopyButton` copy without React: its `data-elanor-copy-value`, or the
 * absolute URL of its `data-elanor-copy-link`. It sets `data-copy-state`, announces
 * `data-elanor-copied-label` or `data-elanor-error-label`, and shows that label in an existing
 * `title`. Once React hydrates the button, the `data-elanor-*` attributes go and it stands down.
 */
export function createCopyButton(button: HTMLElement): Behavior {
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
    if (title) button.setAttribute('title', feedback || title);
    if (feedback) announce(feedback, button);
    // Errors stay until the next press, so they aren't missed.
    if (state === 'copied') {
      // Minified CSS may write the token in seconds.
      const token = getComputedStyle(button).getPropertyValue('--semantic-duration-confirmation');
      const duration = Number.parseFloat(token) * (token.trim().endsWith('ms') ? 1 : 1000) || 2000;
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
    const link = button.dataset.elanorCopyLink;
    const value =
      link === undefined ? button.dataset.elanorCopyValue : new URL(link, location.href).href;
    if (event.defaultPrevented || value === undefined) return;
    if (button.matches(':disabled, [data-disabled]')) return;
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
