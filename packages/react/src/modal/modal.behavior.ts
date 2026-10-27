import type {Behavior} from '../utils/enhance.ts';

/** Event that closes an open static modal when dispatched on its dialog. */
export const modalCloseEvent = 'elanor:modal-close';

/**
 * Opens and closes a server-rendered `Modal.StaticPopup` without React, animating both. Without
 * the behavior, its buttons open and close the native dialog through invoker commands. Dispatch
 * `modalCloseEvent` on the dialog to close it.
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

  // The backdrop belongs to the dialog element, so a pointer on it targets the dialog outside its
  // box.
  function onBackdrop(event: MouseEvent): boolean {
    if (event.target !== dialog) return false;
    const box = dialog.getBoundingClientRect();
    return (
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom
    );
  }

  let pressedOnBackdrop = false;

  function onPointerDown(event: PointerEvent): void {
    pressedOnBackdrop = onBackdrop(event);
  }

  // Like the React modal, only a press that starts and ends on the backdrop closes it, so dragging
  // out of the dialog, such as when selecting text, keeps it open.
  function onClick(event: MouseEvent): void {
    const started = pressedOnBackdrop;
    pressedOnBackdrop = false;
    if (started && onBackdrop(event)) close();
  }

  // Form submissions and scripts can close the dialog without the behavior. The event arrives a
  // task later, by when the dialog may have opened again.
  function onClose(): void {
    if (!dialog.open) setOpenState(false);
  }

  for (const button of buttons) button.addEventListener('click', onButtonClick);
  dialog.addEventListener(modalCloseEvent, close);
  dialog.addEventListener('cancel', onCancel);
  dialog.addEventListener('pointerdown', onPointerDown);
  dialog.addEventListener('click', onClick);
  dialog.addEventListener('close', onClose);
  return {
    destroy() {
      // Stops transitions still running from finishing the open or close.
      change++;
      for (const button of buttons) button.removeEventListener('click', onButtonClick);
      dialog.removeEventListener(modalCloseEvent, close);
      dialog.removeEventListener('cancel', onCancel);
      dialog.removeEventListener('pointerdown', onPointerDown);
      dialog.removeEventListener('click', onClick);
      dialog.removeEventListener('close', onClose);
      // Finishes a close in progress, so the dialog matches its state for the next behavior.
      if (dialog.hasAttribute('data-ending-style')) dialog.close();
      dialog.removeAttribute('data-starting-style');
      dialog.removeAttribute('data-ending-style');
      setOpenState(dialog.open);
    },
  };
}
