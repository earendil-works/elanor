import {Dialog as BaseDialog} from '@base-ui/react/dialog';

export {
  ModalBackdrop as Backdrop,
  ModalViewport as Viewport,
  ModalPopup as Popup,
  ModalTitle as Title,
  ModalDescription as Description,
  ModalBody as Body,
  ModalActions as Actions,
} from './modal.tsx';

export const Root = BaseDialog.Root;
export const Trigger = BaseDialog.Trigger;
export const Portal = BaseDialog.Portal;
export const Close = BaseDialog.Close;
export const createHandle = BaseDialog.createHandle;
