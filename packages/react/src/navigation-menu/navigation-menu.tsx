import {NavigationMenu as BaseNavigationMenu} from '@base-ui/react/navigation-menu';
import {forwardRef} from 'react';
import styles from './navigation-menu.module.css';
import {mergeClassName} from '../utils/class-names.ts';

export type {
  NavigationMenuRootState,
  NavigationMenuRootProps,
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
  NavigationMenuBackdropState,
  NavigationMenuBackdropProps,
  NavigationMenuArrowState,
  NavigationMenuArrowProps,
  NavigationMenuLinkState,
  NavigationMenuIconState,
} from '@base-ui/react/navigation-menu';

export type NavigationMenuListProps = BaseNavigationMenu.List.Props;
export type NavigationMenuItemProps = BaseNavigationMenu.Item.Props;
export type NavigationMenuLinkProps = BaseNavigationMenu.Link.Props;
export type NavigationMenuTriggerProps = BaseNavigationMenu.Trigger.Props;
export type NavigationMenuIconProps = BaseNavigationMenu.Icon.Props;
export type NavigationMenuPopupProps = BaseNavigationMenu.Popup.Props;
export type NavigationMenuContentProps = BaseNavigationMenu.Content.Props;

export const NavigationMenuList = forwardRef<HTMLUListElement, NavigationMenuListProps>(
  function NavigationMenuList({className, ...props}, ref) {
    return (
      <BaseNavigationMenu.List
        {...props}
        ref={ref}
        className={mergeClassName<BaseNavigationMenu.List.State>(styles.list, className)}
      />
    );
  },
);

export const NavigationMenuItem = forwardRef<HTMLLIElement, NavigationMenuItemProps>(
  function NavigationMenuItem({className, ...props}, ref) {
    return (
      <BaseNavigationMenu.Item
        {...props}
        ref={ref}
        className={mergeClassName<BaseNavigationMenu.Item.State>(styles.listItem, className)}
      />
    );
  },
);

export const NavigationMenuLink = forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  function NavigationMenuLink({className, ...props}, ref) {
    return (
      <BaseNavigationMenu.Link
        {...props}
        ref={ref}
        className={mergeClassName<BaseNavigationMenu.Link.State>(styles.navigationItem, className)}
      />
    );
  },
);

export const NavigationMenuTrigger = forwardRef<
  HTMLButtonElement,
  NavigationMenuTriggerProps
>(function NavigationMenuTrigger({className, ...props}, ref) {
  return (
    <BaseNavigationMenu.Trigger
      {...props}
      ref={ref}
      className={mergeClassName<BaseNavigationMenu.Trigger.State>(
        styles.navigationItem,
        className,
      )}
    />
  );
});

export const NavigationMenuIcon = forwardRef<HTMLSpanElement, NavigationMenuIconProps>(
  function NavigationMenuIcon({className, ...props}, ref) {
    return (
      <BaseNavigationMenu.Icon
        {...props}
        ref={ref}
        className={mergeClassName<BaseNavigationMenu.Icon.State>(styles.icon, className)}
      />
    );
  },
);

export const NavigationMenuPositioner = BaseNavigationMenu.Positioner;

export const NavigationMenuPopup = forwardRef<HTMLElement, NavigationMenuPopupProps>(
  function NavigationMenuPopup({className, ...props}, ref) {
    return (
      <BaseNavigationMenu.Popup
        {...props}
        ref={ref}
        className={mergeClassName<BaseNavigationMenu.Popup.State>(styles.popup, className)}
      />
    );
  },
);

export const NavigationMenuContent = forwardRef<
  HTMLDivElement,
  NavigationMenuContentProps
>(function NavigationMenuContent({className, ...props}, ref) {
  return (
    <BaseNavigationMenu.Content
      {...props}
      ref={ref}
      className={mergeClassName<BaseNavigationMenu.Content.State>(styles.content, className)}
    />
  );
});

export const NavigationMenu = {
  Root: BaseNavigationMenu.Root,
  Backdrop: BaseNavigationMenu.Backdrop,
  Arrow: BaseNavigationMenu.Arrow,
  List: NavigationMenuList,
  Item: NavigationMenuItem,
  Link: NavigationMenuLink,
  Trigger: NavigationMenuTrigger,
  Icon: NavigationMenuIcon,
  Content: NavigationMenuContent,
  Portal: BaseNavigationMenu.Portal,
  Positioner: NavigationMenuPositioner,
  Popup: NavigationMenuPopup,
  Viewport: BaseNavigationMenu.Viewport,
} as const;
