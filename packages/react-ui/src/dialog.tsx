import {Dialog as BaseDialog} from '@base-ui/react/dialog';
import {forwardRef, type HTMLAttributes} from 'react';
import styles from './dialog.module.css';
import {classes, mergeClassName} from './shared.ts';

export type {
  DialogRootProps as ModalRootProps,
  DialogRootActions as ModalRootActions,
  DialogRootChangeEventReason as ModalRootChangeEventReason,
  DialogRootChangeEventDetails as ModalRootChangeEventDetails,
  DialogTriggerProps as ModalTriggerProps,
  DialogTriggerState as ModalTriggerState,
  DialogPortalState as ModalPortalState,
  DialogPortalProps as ModalPortalProps,
  DialogPopupProps as ModalPopupProps,
  DialogPopupState as ModalPopupState,
  DialogBackdropProps as ModalBackdropProps,
  DialogBackdropState as ModalBackdropState,
  DialogTitleProps as ModalTitleProps,
  DialogTitleState as ModalTitleState,
  DialogDescriptionProps as ModalDescriptionProps,
  DialogDescriptionState as ModalDescriptionState,
  DialogCloseProps as ModalCloseProps,
  DialogCloseState as ModalCloseState,
  DialogViewportState as ModalViewportState,
  DialogViewportProps as ModalViewportProps,
} from '@base-ui/react/dialog';

export type ModalHandle<Payload = unknown> = BaseDialog.Handle<Payload>;

export const ModalBackdrop = forwardRef<HTMLDivElement, BaseDialog.Backdrop.Props>(
  function ModalBackdrop({className, ...props}, ref) {
    return (
      <BaseDialog.Backdrop
        {...props}
        ref={ref}
        className={mergeClassName<BaseDialog.Backdrop.State>(styles.backdrop, className)}
      />
    );
  },
);

export const ModalViewport = forwardRef<HTMLDivElement, BaseDialog.Viewport.Props>(
  function ModalViewport({className, ...props}, ref) {
    return (
      <BaseDialog.Viewport
        {...props}
        ref={ref}
        className={mergeClassName<BaseDialog.Viewport.State>(styles.viewport, className)}
      />
    );
  },
);

export const ModalPopup = forwardRef<HTMLDivElement, BaseDialog.Popup.Props>(function ModalPopup(
  {className, ...props},
  ref,
) {
  return (
    <BaseDialog.Popup
      {...props}
      ref={ref}
      className={mergeClassName<BaseDialog.Popup.State>(styles.popup, className)}
    />
  );
});

export const ModalTitle = forwardRef<HTMLHeadingElement, BaseDialog.Title.Props>(
  function ModalTitle({className, ...props}, ref) {
    return (
      <BaseDialog.Title
        {...props}
        ref={ref}
        className={mergeClassName<BaseDialog.Title.State>(styles.title, className)}
      />
    );
  },
);

export const ModalDescription = forwardRef<HTMLParagraphElement, BaseDialog.Description.Props>(
  function ModalDescription({className, ...props}, ref) {
    return (
      <BaseDialog.Description
        {...props}
        ref={ref}
        className={mergeClassName<BaseDialog.Description.State>(styles.description, className)}
      />
    );
  },
);

export const ModalBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function ModalBody(
  {className, ...props},
  ref,
) {
  return <div {...props} ref={ref} className={classes(styles.body, className)} />;
});

export const ModalActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function ModalActions(
  {className, ...props},
  ref,
) {
  return <div {...props} ref={ref} className={classes(styles.actions, className)} />;
});

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
