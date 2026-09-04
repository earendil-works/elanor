import {NavigationMenu as BaseNavigationMenu} from '@base-ui/react/navigation-menu';
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ReactNode,
} from 'react';
import styles from './navigation.module.css';
import {classes, mergeClassName} from './shared.ts';

export type {
  NavigationMenuRootState,
  NavigationMenuRootProps,
  NavigationMenuRootActions,
  NavigationMenuRootChangeEventReason,
  NavigationMenuRootChangeEventDetails,
  NavigationMenuTriggerState,
  NavigationMenuTriggerProps,
  NavigationMenuPortalState,
  NavigationMenuPortalProps,
  NavigationMenuPositionerState,
  NavigationMenuPositionerProps,
  NavigationMenuViewportState,
  NavigationMenuViewportProps,
  NavigationMenuListState,
  NavigationMenuListProps,
  NavigationMenuItemState,
  NavigationMenuItemProps,
  NavigationMenuContentState,
  NavigationMenuContentProps,
  NavigationMenuPopupState,
  NavigationMenuPopupProps,
  NavigationMenuBackdropState,
  NavigationMenuBackdropProps,
  NavigationMenuArrowState,
  NavigationMenuArrowProps,
  NavigationMenuLinkState,
  NavigationMenuLinkProps,
  NavigationMenuIconState,
  NavigationMenuIconProps,
} from '@base-ui/react/navigation-menu';

export interface NavigationItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  readonly active?: boolean;
  readonly indicator?: ReactNode;
}

export const NavigationItem = forwardRef<HTMLAnchorElement, NavigationItemProps>(
  function NavigationItem({active = false, indicator, className, children, ...props}, ref) {
    return (
      <a
        {...props}
        ref={ref}
        aria-current={active ? 'page' : props['aria-current']}
        data-active={active ? '' : undefined}
        className={classes(styles.navigationItem, className)}
      >
        <span className={styles.label}>{children}</span>
        {indicator ? <span className={styles.icon}>{indicator}</span> : null}
      </a>
    );
  },
);

export const NavigationMenuList = forwardRef<HTMLUListElement, BaseNavigationMenu.List.Props>(
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

export const NavigationMenuItem = forwardRef<HTMLLIElement, BaseNavigationMenu.Item.Props>(
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

export const NavigationMenuLink = forwardRef<HTMLAnchorElement, BaseNavigationMenu.Link.Props>(
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
  BaseNavigationMenu.Trigger.Props
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

export const NavigationMenuIcon = forwardRef<HTMLSpanElement, BaseNavigationMenu.Icon.Props>(
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

export const NavigationMenuPopup = forwardRef<HTMLElement, BaseNavigationMenu.Popup.Props>(
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
  BaseNavigationMenu.Content.Props
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
