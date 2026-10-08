import {Menu as BaseMenu} from '@base-ui/react/menu';
import {
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuLinkItem,
  MenuPopup,
  MenuPositioner,
  MenuSeparator,
} from './menu.tsx';

// Keep utilities outside the component-only Fast Refresh boundary.
export const Menu = {
  Root: BaseMenu.Root,
  Viewport: BaseMenu.Viewport,
  Handle: BaseMenu.Handle,
  Trigger: BaseMenu.Trigger,
  Portal: BaseMenu.Portal,
  Positioner: MenuPositioner,
  Popup: MenuPopup,
  Item: MenuItem,
  LinkItem: MenuLinkItem,
  Group: MenuGroup,
  GroupLabel: MenuGroupLabel,
  Separator: MenuSeparator,
  createHandle: BaseMenu.createHandle,
} as const;

export {
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuLinkItem,
  MenuPopup,
  MenuPositioner,
  MenuSeparator,
};
export type {
  MenuGroupLabelProps,
  MenuGroupProps,
  MenuHandle,
  MenuItemProps,
  MenuItemState,
  MenuLinkItemProps,
  MenuLinkItemState,
  MenuPopupProps,
  MenuPopupState,
  MenuPortalProps,
  MenuPositionerProps,
  MenuPositionerState,
  MenuRootActions,
  MenuRootChangeEventDetails,
  MenuRootChangeEventReason,
  MenuRootProps,
  MenuSeparatorProps,
  MenuTriggerProps,
  MenuTriggerState,
  MenuViewportProps,
  MenuViewportState,
} from './menu.tsx';
