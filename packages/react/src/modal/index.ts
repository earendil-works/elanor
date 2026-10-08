import {Dialog as BaseDialog} from '@base-ui/react/dialog';
import {
  ModalActions,
  ModalBackdrop,
  ModalBody,
  ModalDescription,
  ModalPopup,
  ModalTitle,
  ModalViewport,
} from './modal.tsx';

// Keep utilities outside the component-only Fast Refresh boundary.
export const Modal = {
  Root: BaseDialog.Root,
  Trigger: BaseDialog.Trigger,
  Portal: BaseDialog.Portal,
  Backdrop: ModalBackdrop,
  Viewport: ModalViewport,
  Popup: ModalPopup,
  Title: ModalTitle,
  Description: ModalDescription,
  Body: ModalBody,
  Actions: ModalActions,
  Close: BaseDialog.Close,
  createHandle: BaseDialog.createHandle,
} as const;

export {
  ModalActions,
  ModalBackdrop,
  ModalBody,
  ModalDescription,
  ModalPopup,
  ModalTitle,
  ModalViewport,
};
export type {
  ModalActionsProps,
  ModalBackdropProps,
  ModalBackdropState,
  ModalBodyProps,
  ModalCloseProps,
  ModalCloseState,
  ModalDescriptionProps,
  ModalHandle,
  ModalPopupProps,
  ModalPopupState,
  ModalPortalProps,
  ModalRootActions,
  ModalRootChangeEventDetails,
  ModalRootChangeEventReason,
  ModalRootProps,
  ModalTitleProps,
  ModalTriggerProps,
  ModalTriggerState,
  ModalViewportProps,
  ModalViewportState,
} from './modal.tsx';
