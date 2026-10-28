import {Drawer as BaseDrawer} from '@base-ui/react/drawer';

export {
  DrawerBackdrop as Backdrop,
  DrawerViewport as Viewport,
  DrawerPopup as Popup,
  DrawerTitle as Title,
  DrawerDescription as Description,
} from './drawer.tsx';

export const Root = BaseDrawer.Root;
export const Trigger = BaseDrawer.Trigger;
export const Portal = BaseDrawer.Portal;
export const Content = BaseDrawer.Content;
export const Close = BaseDrawer.Close;
export const VirtualKeyboardProvider = BaseDrawer.VirtualKeyboardProvider;
export const createHandle = BaseDrawer.createHandle;
