import {Dialog as BaseDialog} from '@base-ui/react/dialog';
import {forwardRef, type ComponentPropsWithRef, type HTMLAttributes} from 'react';
import styles from './modal.module.css';
import {useSurfaceClassName} from '../appearance/appearance.tsx';
import {classes, mergeClassName} from '../utils/class-names.ts';

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

export type ModalBackdropProps = BaseDialog.Backdrop.Props;
export type ModalViewportProps = BaseDialog.Viewport.Props;
export interface ModalPopupProps extends BaseDialog.Popup.Props {
  /** The inner scroll container; the popup ref/style/className remain on the surface. */
  readonly bodyProps?: Omit<ComponentPropsWithRef<'div'>, 'children' | 'dangerouslySetInnerHTML'>;
}
export type ModalTitleProps = BaseDialog.Title.Props;
export type ModalDescriptionProps = BaseDialog.Description.Props;

export const ModalBackdrop = forwardRef<HTMLDivElement, ModalBackdropProps>(
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

export const ModalViewport = forwardRef<HTMLDivElement, ModalViewportProps>(
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

export const ModalPopup = forwardRef<HTMLDivElement, ModalPopupProps>(function ModalPopup(
  {className, bodyProps, children, ...props},
  ref,
) {
  const surfaceClassName = useSurfaceClassName();
  return (
    <BaseDialog.Popup
      data-outline="box-small"
      data-outline-focus="none"
      {...props}
      ref={ref}
      className={mergeClassName<BaseDialog.Popup.State>(classes(styles.popup, surfaceClassName), className)}
    >
      {/* Content scrolls inside, independently of the popup surface. */}
      <div data-surface-content="" {...bodyProps} className={classes(styles.body, bodyProps?.className)}>{children}</div>
    </BaseDialog.Popup>
  );
});

export const ModalTitle = forwardRef<HTMLHeadingElement, ModalTitleProps>(
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

export const ModalDescription = forwardRef<HTMLParagraphElement, ModalDescriptionProps>(
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

export interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {}

export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(function ModalBody(
  {className, ...props},
  ref,
) {
  return <div {...props} ref={ref} className={classes(styles.body, className)} />;
});

export interface ModalActionsProps extends HTMLAttributes<HTMLDivElement> {}

export const ModalActions = forwardRef<HTMLDivElement, ModalActionsProps>(function ModalActions(
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
