import {Toast as BaseToast} from '@base-ui/react/toast';
import {forwardRef} from 'react';
import styles from './toast.module.css';
import {mergeClassName} from './shared.ts';

export type {
  ToastRootState,
  ToastRootProps,
  ToastProviderProps,
  ToastViewportState,
  ToastViewportProps,
  ToastContentState,
  ToastContentProps,
  ToastDescriptionState,
  ToastDescriptionProps,
  ToastTitleState,
  ToastTitleProps,
  ToastCloseState,
  ToastCloseProps,
  ToastActionState,
  ToastActionProps,
  ToastPortalState,
  ToastPortalProps,
  ToastPositionerState,
  ToastPositionerProps,
  ToastArrowState,
  ToastArrowProps,
  ToastObject,
  ToastManagerPositionerProps,
  UseToastManagerReturnValue,
  ToastManagerAddOptions,
  ToastManagerUpdateOptions,
  ToastManagerPromiseOptions,
  ToastManager,
} from '@base-ui/react/toast';

export const ToastViewport = forwardRef<HTMLDivElement, BaseToast.Viewport.Props>(
  function ToastViewport({className, ...props}, ref) {
    return (
      <BaseToast.Viewport
        {...props}
        ref={ref}
        className={mergeClassName<BaseToast.Viewport.State>(styles.viewport, className)}
      />
    );
  },
);

export const ToastRoot = forwardRef<HTMLDivElement, BaseToast.Root.Props>(
  function ToastRoot({className, swipeDirection = [], ...props}, ref) {
    return (
      <BaseToast.Root
        {...props}
        ref={ref}
        swipeDirection={swipeDirection}
        className={mergeClassName<BaseToast.Root.State>(styles.root, className)}
      />
    );
  },
);

export const ToastContent = forwardRef<HTMLDivElement, BaseToast.Content.Props>(
  function ToastContent({className, ...props}, ref) {
    return (
      <BaseToast.Content
        {...props}
        ref={ref}
        className={mergeClassName<BaseToast.Content.State>(styles.content, className)}
      />
    );
  },
);

export const ToastTitle = forwardRef<HTMLDivElement, BaseToast.Title.Props>(
  function ToastTitle({className, ...props}, ref) {
    return (
      <BaseToast.Title
        {...props}
        ref={ref}
        className={mergeClassName<BaseToast.Title.State>(styles.title, className)}
      />
    );
  },
);

export const ToastDescription = forwardRef<HTMLDivElement, BaseToast.Description.Props>(
  function ToastDescription({className, ...props}, ref) {
    return (
      <BaseToast.Description
        {...props}
        ref={ref}
        className={mergeClassName<BaseToast.Description.State>(styles.description, className)}
      />
    );
  },
);

export const ToastClose = forwardRef<HTMLButtonElement, BaseToast.Close.Props>(
  function ToastClose({className, type = 'button', ...props}, ref) {
    return (
      <BaseToast.Close
        {...props}
        ref={ref}
        type={type}
        className={mergeClassName<BaseToast.Close.State>(styles.close, className)}
      />
    );
  },
);

export const Toast = {
  Provider: BaseToast.Provider,
  Portal: BaseToast.Portal,
  Viewport: ToastViewport,
  Root: ToastRoot,
  Content: ToastContent,
  Title: ToastTitle,
  Description: ToastDescription,
  Close: ToastClose,
  Action: BaseToast.Action,
  Positioner: BaseToast.Positioner,
  Arrow: BaseToast.Arrow,
  useToastManager: BaseToast.useToastManager,
  createToastManager: BaseToast.createToastManager,
} as const;
