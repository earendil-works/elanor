import {Drawer as BaseDrawer} from '@base-ui/react/drawer';

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
  DrawerVirtualKeyboardProviderProps,
} from '@base-ui/react/drawer';

export type DrawerHandle<Payload = unknown> = BaseDrawer.Handle<Payload>;
export type DrawerSnapPoint = BaseDrawer.Root.SnapPoint;

export type DrawerBackdropProps = BaseDrawer.Backdrop.Props;
export type DrawerBackdropState = BaseDrawer.Backdrop.State;

export function DrawerBackdrop({ref, className, ...props}: DrawerBackdropProps) {
  return (
    <BaseDrawer.Backdrop
      {...props}
      ref={ref}
      className={mergeClassName<BaseDrawer.Backdrop.State>(styles.backdrop, className)}
    />
  );
}

export type DrawerViewportProps = BaseDrawer.Viewport.Props;
export type DrawerViewportState = BaseDrawer.Viewport.State;

export function DrawerViewport({ref, className, ...props}: DrawerViewportProps) {
  return (
    <BaseDrawer.Viewport
      {...props}
      ref={ref}
      className={mergeClassName<BaseDrawer.Viewport.State>(styles.viewport, className)}
    />
  );
}

export type DrawerPopupProps = BaseDrawer.Popup.Props;
export type DrawerPopupState = BaseDrawer.Popup.State;

export function DrawerPopup({ref, className, ...props}: DrawerPopupProps) {
  return (
    <BaseDrawer.Popup
      {...props}
      ref={ref}
      className={mergeClassName<BaseDrawer.Popup.State>(styles.popup, className)}
    />
  );
}

export type DrawerTitleProps = BaseDrawer.Title.Props;

export function DrawerTitle({ref, className, ...props}: DrawerTitleProps) {
  return (
    <BaseDrawer.Title
      {...props}
      ref={ref}
      className={mergeClassName<BaseDrawer.Title.State>(styles.title, className)}
    />
  );
}

export type DrawerDescriptionProps = BaseDrawer.Description.Props;

export function DrawerDescription({ref, className, ...props}: DrawerDescriptionProps) {
  return (
    <BaseDrawer.Description
      {...props}
      ref={ref}
      className={mergeClassName<BaseDrawer.Description.State>(styles.description, className)}
    />
  );
}
