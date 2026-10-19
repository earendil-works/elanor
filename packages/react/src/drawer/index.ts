import {Drawer as BaseDrawer} from '@base-ui/react/drawer';

export {
  DrawerRoot as Root,
  DrawerBackdrop as Backdrop,
  DrawerViewport as Viewport,
  DrawerPopup as Popup,
  DrawerTitle as Title,
  DrawerDescription as Description,
} from './drawer.tsx';
export {DrawerPage as Page, DrawerStack as Stack} from './drawer-stack.tsx';

export const Trigger = BaseDrawer.Trigger;
export const Portal = BaseDrawer.Portal;
export const Content = BaseDrawer.Content;
export const Close = BaseDrawer.Close;
export const createHandle = BaseDrawer.createHandle;
