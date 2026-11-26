import {Dialog as BaseDialog} from '@base-ui/react/dialog';
import type {HTMLAttributes, Ref} from 'react';

import {classes, mergeClassName} from '../utils/class-names.ts';

import styles from './modal.module.css';

export type {
  DialogRootProps as ModalRootProps,
  DialogRootActions as ModalRootActions,
  DialogRootChangeEventReason as ModalRootChangeEventReason,
  DialogRootChangeEventDetails as ModalRootChangeEventDetails,
  DialogTriggerProps as ModalTriggerProps,
  DialogTriggerState as ModalTriggerState,
  DialogPortalProps as ModalPortalProps,
  DialogPopupState as ModalPopupState,
  DialogBackdropState as ModalBackdropState,
  DialogCloseProps as ModalCloseProps,
  DialogCloseState as ModalCloseState,
  DialogViewportState as ModalViewportState,
} from '@base-ui/react/dialog';

export type ModalHandle<Payload = unknown> = BaseDialog.Handle<Payload>;

export type ModalBackdropVariant = 'default' | 'blur';

export interface ModalBackdropProps extends BaseDialog.Backdrop.Props {
  /** `blur` blurs the page behind the backdrop. */
  readonly variant?: ModalBackdropVariant | undefined;
}
export type ModalViewportProps = BaseDialog.Viewport.Props;
export type ModalPopupProps = BaseDialog.Popup.Props;
export type ModalTitleProps = BaseDialog.Title.Props;
export type ModalDescriptionProps = BaseDialog.Description.Props;

/** Renders `data-variant`. */
export function ModalBackdrop({ref, variant = 'default', className, ...props}: ModalBackdropProps) {
  return (
    <BaseDialog.Backdrop
      {...props}
      ref={ref}
      data-variant={variant}
      className={mergeClassName<BaseDialog.Backdrop.State>(styles.backdrop, className)}
    />
  );
}

export function ModalViewport({ref, className, ...props}: ModalViewportProps) {
  return (
    <BaseDialog.Viewport
      {...props}
      ref={ref}
      className={mergeClassName<BaseDialog.Viewport.State>(styles.viewport, className)}
    />
  );
}

export function ModalPopup({ref, className, ...props}: ModalPopupProps) {
  return (
    <BaseDialog.Popup
      {...props}
      ref={ref}
      className={mergeClassName<BaseDialog.Popup.State>(styles.popup, className)}
    />
  );
}

export function ModalTitle({ref, className, ...props}: ModalTitleProps) {
  return (
    <BaseDialog.Title
      {...props}
      ref={ref}
      className={mergeClassName<BaseDialog.Title.State>(styles.title, className)}
    />
  );
}

export function ModalDescription({ref, className, ...props}: ModalDescriptionProps) {
  return (
    <BaseDialog.Description
      {...props}
      ref={ref}
      className={mergeClassName<BaseDialog.Description.State>(styles.description, className)}
    />
  );
}

export interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

export function ModalBody({ref, className, ...props}: ModalBodyProps) {
  return <div {...props} ref={ref} className={classes(styles.body, className)} />;
}

export interface ModalActionsProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

export function ModalActions({ref, className, ...props}: ModalActionsProps) {
  return <div {...props} ref={ref} className={classes(styles.actions, className)} />;
}
