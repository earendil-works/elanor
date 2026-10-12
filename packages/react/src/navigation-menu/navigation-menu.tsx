import {NavigationMenu as BaseNavigationMenu} from '@base-ui/react/navigation-menu';
import {KeyboardArrowDownIcon} from '@earendil-works/elanor-icons-react';

import {mergeClassName} from '../utils/class-names.ts';

import styles from './navigation-menu.module.css';

export type {
  NavigationMenuRootState,
  NavigationMenuRootActions,
  NavigationMenuRootChangeEventReason,
  NavigationMenuRootChangeEventDetails,
  NavigationMenuTriggerState,
  NavigationMenuPortalProps,
  NavigationMenuPositionerState,
  NavigationMenuPositionerProps,
  NavigationMenuViewportProps,
  NavigationMenuListState,
  NavigationMenuContentState,
  NavigationMenuPopupState,
  NavigationMenuLinkState,
  NavigationMenuIconState,
} from '@base-ui/react/navigation-menu';

export interface NavigationMenuRootProps<Value = any> extends Omit<
  BaseNavigationMenu.Root.Props<Value>,
  'orientation'
> {
  readonly orientation?: 'horizontal';
}

export type NavigationMenuListProps = BaseNavigationMenu.List.Props;
export type NavigationMenuItemProps = BaseNavigationMenu.Item.Props;
export type NavigationMenuLinkProps = BaseNavigationMenu.Link.Props;
export type NavigationMenuTriggerProps = BaseNavigationMenu.Trigger.Props;
export type NavigationMenuIconProps = BaseNavigationMenu.Icon.Props;
export type NavigationMenuPopupProps = BaseNavigationMenu.Popup.Props;
export type NavigationMenuContentProps = BaseNavigationMenu.Content.Props;

export function NavigationMenuRoot<Value = any>({ref, ...props}: NavigationMenuRootProps<Value>) {
  return <BaseNavigationMenu.Root {...props} ref={ref} orientation="horizontal" />;
}

export function NavigationMenuList({ref, className, ...props}: NavigationMenuListProps) {
  return (
    <BaseNavigationMenu.List
      {...props}
      ref={ref}
      className={mergeClassName<BaseNavigationMenu.List.State>(styles.list, className)}
    />
  );
}

export function NavigationMenuItem({ref, className, ...props}: NavigationMenuItemProps) {
  return (
    <BaseNavigationMenu.Item
      {...props}
      ref={ref}
      className={mergeClassName<BaseNavigationMenu.Item.State>(styles.listItem, className)}
    />
  );
}

export function NavigationMenuLink({ref, className, ...props}: NavigationMenuLinkProps) {
  return (
    <BaseNavigationMenu.Link
      {...props}
      ref={ref}
      className={mergeClassName<BaseNavigationMenu.Link.State>(styles.navigationItem, className)}
    />
  );
}

export function NavigationMenuTrigger({ref, className, ...props}: NavigationMenuTriggerProps) {
  return (
    <BaseNavigationMenu.Trigger
      {...props}
      ref={ref}
      className={mergeClassName<BaseNavigationMenu.Trigger.State>(styles.navigationItem, className)}
    />
  );
}

export function NavigationMenuIcon({ref, className, children, ...props}: NavigationMenuIconProps) {
  return (
    <BaseNavigationMenu.Icon
      {...props}
      ref={ref}
      className={mergeClassName<BaseNavigationMenu.Icon.State>(styles.icon, className)}
    >
      {children ?? <KeyboardArrowDownIcon />}
    </BaseNavigationMenu.Icon>
  );
}

export const NavigationMenuPositioner = BaseNavigationMenu.Positioner;

export function NavigationMenuPopup({ref, className, ...props}: NavigationMenuPopupProps) {
  return (
    <BaseNavigationMenu.Popup
      {...props}
      ref={ref}
      className={mergeClassName<BaseNavigationMenu.Popup.State>(styles.popup, className)}
    />
  );
}

export function NavigationMenuContent({ref, className, ...props}: NavigationMenuContentProps) {
  return (
    <BaseNavigationMenu.Content
      {...props}
      ref={ref}
      className={mergeClassName<BaseNavigationMenu.Content.State>(styles.content, className)}
    />
  );
}
