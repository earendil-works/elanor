import type {Behavior} from '../utils/enhance.ts';

type CopyState = 'idle' | 'copied' | 'error';

/**
 * Makes a server-rendered `CopyButton` copy without React: its `data-elanor-copy-value`, or the
 * absolute URL of its `data-elanor-copy-link`. Once React hydrates the button, it drops both and
 * this behavior stands down.
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
