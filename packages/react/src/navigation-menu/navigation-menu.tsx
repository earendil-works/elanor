import {NavigationMenu as BaseNavigationMenu} from '@base-ui/react/navigation-menu';
import {KeyboardArrowDownIcon} from '@earendil-works/elanor-icons-react';
import {forwardRef, type ComponentPropsWithRef} from 'react';
import styles from './navigation-menu.module.css';
import {useSurfaceClassName} from '../appearance/appearance.tsx';
import {classes, mergeClassName} from '../utils/class-names.ts';

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
export interface NavigationMenuPopupProps extends BaseNavigationMenu.Popup.Props {
  /** The inner scroll container; the popup ref/style/className remain on the surface. */
  readonly bodyProps?: Omit<ComponentPropsWithRef<'div'>, 'children' | 'dangerouslySetInnerHTML'>;
}
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
    const surfaceClassName = useSurfaceClassName();
    return (
      <BaseNavigationMenu.Link
        data-outline="line"
        data-outline-edge="block-end"
        data-outline-focus="self"
        {...props}
        ref={ref}
        className={mergeClassName<BaseNavigationMenu.Link.State>(classes(styles.navigationItem, surfaceClassName), className)}
      />
    );
  },
);

export const NavigationMenuTrigger = forwardRef<
  HTMLButtonElement,
  NavigationMenuTriggerProps
>(function NavigationMenuTrigger({className, ...props}, ref) {
  const surfaceClassName = useSurfaceClassName();
  return (
    <BaseNavigationMenu.Trigger
      data-outline="line"
      data-outline-edge="block-end"
      data-outline-focus="self"
      {...props}
      ref={ref}
      className={mergeClassName<BaseNavigationMenu.Trigger.State>(
        classes(styles.navigationItem, surfaceClassName),
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
  function NavigationMenuPopup({className, bodyProps, children, ...props}, ref) {
    const surfaceClassName = useSurfaceClassName();
    return (
      <BaseNavigationMenu.Popup
        data-outline="box-small"
        data-outline-focus="none"
        {...props}
        ref={ref}
        className={mergeClassName<BaseNavigationMenu.Popup.State>(classes(styles.popup, surfaceClassName), className)}
      >
        {/* Content scrolls inside, independently of the popup surface. */}
        <div data-surface-content="" {...bodyProps} className={classes(styles.body, bodyProps?.className)}>{children}</div>
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
