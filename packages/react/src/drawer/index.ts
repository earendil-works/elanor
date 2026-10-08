import {Drawer as BaseDrawer} from '@base-ui/react/drawer';

import {
  DrawerBackdrop,
  DrawerViewport,
  DrawerPopup,
  DrawerTitle,
  DrawerDescription,
} from './drawer.tsx';

export const Drawer = {
  Root: BaseDrawer.Root,
  Trigger: BaseDrawer.Trigger,
  Portal: BaseDrawer.Portal,
  Backdrop: DrawerBackdrop,
  Viewport: DrawerViewport,
  Popup: DrawerPopup,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Content: BaseDrawer.Content,
  Close: BaseDrawer.Close,
  createHandle: BaseDrawer.createHandle,
} as const;

export {DrawerBackdrop, DrawerViewport, DrawerPopup, DrawerTitle, DrawerDescription};
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
  DrawerHandle,
  DrawerSnapPoint,
  DrawerBackdropProps,
  DrawerBackdropState,
  DrawerViewportProps,
  DrawerViewportState,
  DrawerPopupProps,
  DrawerPopupState,
  DrawerTitleProps,
  DrawerDescriptionProps,
} from './drawer.tsx';
