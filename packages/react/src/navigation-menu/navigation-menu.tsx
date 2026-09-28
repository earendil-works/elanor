import {NavigationMenu as BaseNavigationMenu} from '@base-ui/react/navigation-menu';
import {KeyboardArrowDownIcon} from '@earendil-works/elanor-icons-react';
import {forwardRef} from 'react';
import styles from './navigation-menu.module.css';
import {mergeClassName} from '../utils/class-names.ts';

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

export interface NavigationMenuRootProps<Value = any>
  extends Omit<BaseNavigationMenu.Root.Props<Value>, 'orientation'> {
  readonly orientation?: 'horizontal';
}

export type NavigationMenuListProps = BaseNavigationMenu.List.Props;
export type NavigationMenuItemProps = BaseNavigationMenu.Item.Props;
export type NavigationMenuLinkProps = BaseNavigationMenu.Link.Props;
export type NavigationMenuTriggerProps = BaseNavigationMenu.Trigger.Props;
export type NavigationMenuIconProps = BaseNavigationMenu.Icon.Props;
export type NavigationMenuPopupProps = BaseNavigationMenu.Popup.Props;
export type NavigationMenuContentProps = BaseNavigationMenu.Content.Props;

// Preserve Base UI's value generic across forwardRef.
const NavigationMenuRoot = forwardRef<HTMLElement, NavigationMenuRootProps<unknown>>(
  function NavigationMenuRoot(props, ref) {
    return <BaseNavigationMenu.Root {...props} ref={ref} orientation="horizontal" />;
  },
) as <Value = any>(props: NavigationMenuRootProps<Value>) => React.JSX.Element;

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
        data-stroke="line"
        data-stroke-edge="block-end"
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
      data-stroke="line"
      data-stroke-edge="block-end"
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
  function NavigationMenuIcon({className, children, ...props}, ref) {
    return (
      <BaseNavigationMenu.Icon
        {...props}
        ref={ref}
        className={mergeClassName<BaseNavigationMenu.Icon.State>(styles.icon, className)}
      >
        {children ?? <KeyboardArrowDownIcon />}
      </BaseNavigationMenu.Icon>
    );
  },
);

export const NavigationMenuPositioner = BaseNavigationMenu.Positioner;

export const NavigationMenuPopup = forwardRef<HTMLElement, NavigationMenuPopupProps>(
  function NavigationMenuPopup({className, children, ...props}, ref) {
    return (
      <BaseNavigationMenu.Popup
        data-stroke="box-small"
        data-stroke-focus="none"
        {...props}
        ref={ref}
        className={mergeClassName<BaseNavigationMenu.Popup.State>(styles.popup, className)}
      >
        {/* Content scrolls inside, so the popup itself can carry the stroke. */}
        <div className={styles.body}>{children}</div>
      </BaseNavigationMenu.Popup>
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
  Root: NavigationMenuRoot,
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
