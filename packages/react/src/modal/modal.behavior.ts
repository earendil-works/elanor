import type {Behavior} from '../utils/enhance.ts';

/**
 * Opens and closes a server-rendered `Modal.StaticPopup` without React, animating both. Without
 * the behavior, its buttons open and close the native dialog through invoker commands.
 */
export function createModal(element: HTMLElement): Behavior {
  if (!(element instanceof HTMLDialogElement)) {
    throw new Error('createModal attaches to Modal.StaticPopup, a dialog.');
  }
  const dialog = element;
  const ownerDocument = dialog.ownerDocument;
  const buttons = [
    ...ownerDocument.querySelectorAll<HTMLButtonElement>(`[commandfor="${dialog.id}"]`),
  ];
  let change = 0;

  for (const name of ['aria-labelledby', 'aria-describedby']) {
    const id = dialog.getAttribute(name);
    if (id && !ownerDocument.getElementById(id)) dialog.removeAttribute(name);
  }

  function setOpenState(open: boolean): void {
    dialog.toggleAttribute('data-open', open);
    dialog.toggleAttribute('data-closed', !open);
  }

  async function transitionsEnd(current: number): Promise<boolean> {
    await Promise.allSettled(dialog.getAnimations().map((animation) => animation.finished));
    return current === change;
  }

  function open(): void {
    change += 1;
    dialog.removeAttribute('data-ending-style');
    // The dialog's first style is the starting one, so it transitions from there.
    dialog.setAttribute('data-starting-style', '');
    dialog.showModal();
    setOpenState(true);
    void dialog.offsetHeight;
    dialog.removeAttribute('data-starting-style');
  }

  function close(): void {
    if (!dialog.open || dialog.hasAttribute('data-ending-style')) return;
    const current = ++change;
    setOpenState(false);
    dialog.setAttribute('data-ending-style', '');
    void transitionsEnd(current).then((latest) => {
      if (!latest) return;
      dialog.close();
      dialog.removeAttribute('data-ending-style');
    });
  }

  function onButtonClick(event: MouseEvent): void {
    const button = event.currentTarget;
    if (!(button instanceof HTMLButtonElement)) return;
    // The behavior opens and closes instead of the browser, to animate the dialog.
    event.preventDefault();
    if (button.getAttribute('command') === 'show-modal') open();
    else close();
  }

  // Escape.
  function onCancel(event: Event): void {
    event.preventDefault();
    close();
  }

  // A press on the backdrop, which belongs to the dialog element.
  function onClick(event: MouseEvent): void {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    const inside =
      event.clientX >= box.left &&
      event.clientX <= box.right &&
      event.clientY >= box.top &&
      event.clientY <= box.bottom;
    if (!inside) close();
  }

  for (const button of buttons) button.addEventListener('click', onButtonClick);
  dialog.addEventListener('cancel', onCancel);
  dialog.addEventListener('click', onClick);
  return {
    destroy() {
      for (const button of buttons) button.removeEventListener('click', onButtonClick);
      dialog.removeEventListener('cancel', onCancel);
      dialog.removeEventListener('click', onClick);
    },
  };
}
