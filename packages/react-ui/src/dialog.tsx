'use client';

import {Dialog as BaseDialog} from '@base-ui/react/dialog';
import {forwardRef, type HTMLAttributes} from 'react';
import styles from './dialog.module.css';
import {classes, mergeClassName} from './shared.js';

export const DialogBackdrop = forwardRef<HTMLDivElement, BaseDialog.Backdrop.Props>(
  function DialogBackdrop({className, ...props}, ref) {
    return (
      <BaseDialog.Backdrop
        {...props}
        ref={ref}
        className={mergeClassName<BaseDialog.Backdrop.State>(styles.backdrop, className)}
      />
    );
  },
);

export const DialogViewport = forwardRef<HTMLDivElement, BaseDialog.Viewport.Props>(
  function DialogViewport({className, ...props}, ref) {
    return (
      <BaseDialog.Viewport
        {...props}
        ref={ref}
        className={mergeClassName<BaseDialog.Viewport.State>(styles.viewport, className)}
      />
    );
  },
);

export const DialogPopup = forwardRef<HTMLDivElement, BaseDialog.Popup.Props>(function DialogPopup(
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

export const DialogTitle = forwardRef<HTMLHeadingElement, BaseDialog.Title.Props>(
  function DialogTitle({className, ...props}, ref) {
    return (
      <BaseDialog.Title
        {...props}
        ref={ref}
        className={mergeClassName<BaseDialog.Title.State>(styles.title, className)}
      />
    );
  },
);

export const DialogDescription = forwardRef<HTMLParagraphElement, BaseDialog.Description.Props>(
  function DialogDescription({className, ...props}, ref) {
    return (
      <BaseDialog.Description
        {...props}
        ref={ref}
        className={mergeClassName<BaseDialog.Description.State>(styles.description, className)}
      />
    );
  },
);

export const DialogBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function DialogBody(
  {className, ...props},
  ref,
) {
  return <div {...props} ref={ref} className={classes(styles.body, className)} />;
});

export const DialogActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function DialogActions(
  {className, ...props},
  ref,
) {
  return <div {...props} ref={ref} className={classes(styles.actions, className)} />;
});

export const Dialog = {
  Root: BaseDialog.Root,
  Trigger: BaseDialog.Trigger,
  Portal: BaseDialog.Portal,
  Backdrop: DialogBackdrop,
  Viewport: DialogViewport,
  Popup: DialogPopup,
  Title: DialogTitle,
  Description: DialogDescription,
  Body: DialogBody,
  Actions: DialogActions,
  Close: BaseDialog.Close,
  createHandle: BaseDialog.createHandle,
} as const;
