import {Drawer as BaseDrawer} from '@base-ui/react/drawer';
import {forwardRef} from 'react';

import {mergeClassName} from '../utils/class-names.ts';

import styles from './drawer.module.css';

export type {
  DrawerRootProps,
  DrawerRootActions,
  DrawerRootChangeEventReason,
  DrawerRootChangeEventDetails,
  DrawerRootSnapPointChangeEventReason,
  DrawerRootSnapPointChangeEventDetails,
  DrawerTriggerProps,
  DrawerTriggerState,
  DrawerPortalProps,
  DrawerCloseProps,
  DrawerCloseState,
  DrawerContentProps,
} from '@base-ui/react/drawer';

export type DrawerHandle<Payload = unknown> = BaseDrawer.Handle<Payload>;
export type DrawerSnapPoint = BaseDrawer.Root.SnapPoint;

export type DrawerBackdropProps = BaseDrawer.Backdrop.Props;
export type DrawerBackdropState = BaseDrawer.Backdrop.State;

export const DrawerBackdrop = forwardRef<HTMLDivElement, DrawerBackdropProps>(
  function DrawerBackdrop({className, ...props}, ref) {
    return (
      <BaseDrawer.Backdrop
        {...props}
        ref={ref}
        className={mergeClassName<BaseDrawer.Backdrop.State>(styles.backdrop, className)}
      />
    );
  },
);

export type DrawerViewportProps = BaseDrawer.Viewport.Props;
export type DrawerViewportState = BaseDrawer.Viewport.State;

export const DrawerViewport = forwardRef<HTMLDivElement, DrawerViewportProps>(
  function DrawerViewport({className, ...props}, ref) {
    return (
      <BaseDrawer.Viewport
        {...props}
        ref={ref}
        className={mergeClassName<BaseDrawer.Viewport.State>(styles.viewport, className)}
      />
    );
  },
);

export type DrawerPopupProps = BaseDrawer.Popup.Props;
export type DrawerPopupState = BaseDrawer.Popup.State;

export const DrawerPopup = forwardRef<HTMLDivElement, DrawerPopupProps>(function DrawerPopup(
  {className, ...props},
  ref,
) {
  return (
    <BaseDrawer.Popup
      {...props}
      ref={ref}
      className={mergeClassName<BaseDrawer.Popup.State>(styles.popup, className)}
    />
  );
});

export type DrawerTitleProps = BaseDrawer.Title.Props;

export const DrawerTitle = forwardRef<HTMLHeadingElement, DrawerTitleProps>(function DrawerTitle(
  {className, ...props},
  ref,
) {
  return (
    <BaseDrawer.Title
      {...props}
      ref={ref}
      className={mergeClassName<BaseDrawer.Title.State>(styles.title, className)}
    />
  );
});

export type DrawerDescriptionProps = BaseDrawer.Description.Props;

export const DrawerDescription = forwardRef<HTMLParagraphElement, DrawerDescriptionProps>(
  function DrawerDescription({className, ...props}, ref) {
    return (
      <BaseDrawer.Description
        {...props}
        ref={ref}
        className={mergeClassName<BaseDrawer.Description.State>(styles.description, className)}
      />
    );
  },
);
