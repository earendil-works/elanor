import {Menu as BaseMenu} from '@base-ui/react/menu';

export {
  MenuPositioner as Positioner,
  MenuPopup as Popup,
  MenuItem as Item,
  MenuLinkItem as LinkItem,
  MenuGroup as Group,
  MenuGroupLabel as GroupLabel,
  MenuSeparator as Separator,
} from './menu.tsx';

export const Root = BaseMenu.Root;
export const Viewport = BaseMenu.Viewport;
export const Handle = BaseMenu.Handle;
export const Trigger = BaseMenu.Trigger;
export const Portal = BaseMenu.Portal;
export const createHandle = BaseMenu.createHandle;
