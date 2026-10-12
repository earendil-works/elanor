import {Menu as BaseMenu} from '@base-ui/react/menu';
import {forwardRef, type ComponentPropsWithRef, type ReactNode} from 'react';
import styles from './menu.module.css';
import {useSurfaceClassName} from '../appearance/appearance.tsx';
import {Separator, type SeparatorProps} from '../separator/separator.tsx';
import {classes, mergeClassName} from '../utils/class-names.ts';

export type {
  MenuRootProps,
  MenuRootActions,
  MenuRootChangeEventReason,
  MenuRootChangeEventDetails,
  MenuItemState,
  MenuLinkItemState,
  MenuPopupState,
  MenuPortalProps,
  MenuPositionerState,
  MenuPositionerProps,
  MenuTriggerProps,
  MenuTriggerState,
  MenuViewportState,
  MenuViewportProps,
} from '@base-ui/react/menu';

export type MenuHandle<Payload = unknown> = BaseMenu.Handle<Payload>;

export interface MenuPopupProps extends BaseMenu.Popup.Props {
  /** The inner scroll container; the popup ref/style/className remain on the surface. */
  readonly bodyProps?: Omit<ComponentPropsWithRef<'div'>, 'children' | 'dangerouslySetInnerHTML'>;
}
export type MenuGroupProps = BaseMenu.Group.Props;
export type MenuGroupLabelProps = BaseMenu.GroupLabel.Props;

export const MenuPositioner = BaseMenu.Positioner;

export const MenuPopup = forwardRef<HTMLDivElement, MenuPopupProps>(function MenuPopup(
  {className, bodyProps, children, ...props},
  ref,
) {
  const surfaceClassName = useSurfaceClassName();
  return (
    <BaseMenu.Popup
      data-outline="box-small"
      data-outline-focus="none"
      {...props}
      ref={ref}
      className={mergeClassName<BaseMenu.Popup.State>(classes(styles.popup, surfaceClassName), className)}
    >
      {/* Content scrolls inside, independently of the popup surface. */}
      <div data-surface-content="" {...bodyProps} className={classes(styles.body, bodyProps?.className)}>{children}</div>
    </BaseMenu.Popup>
  );
});

interface MenuItemContentProps {
  readonly children?: ReactNode;
  readonly icon?: ReactNode;
  readonly endAdornment?: ReactNode;
}

function MenuItemContent({children, icon, endAdornment}: MenuItemContentProps): React.JSX.Element {
  return (
    <>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <span className={styles.label}>{children}</span>
      {endAdornment ? <span className={styles.icon}>{endAdornment}</span> : null}
    </>
  );
}

export interface MenuItemProps
  extends Omit<BaseMenu.Item.Props, 'children'>,
    MenuItemContentProps {}

export const MenuItem = forwardRef<HTMLElement, MenuItemProps>(function MenuItem(
  {children, icon, endAdornment, className, ...props},
  ref,
) {
  const surfaceClassName = useSurfaceClassName();
  return (
    <BaseMenu.Item
      data-outline="box-small"
      data-outline-focus="none"
      {...props}
      ref={ref}
      className={mergeClassName<BaseMenu.Item.State>(classes(styles.item, surfaceClassName), className)}
    >
      <MenuItemContent icon={icon} endAdornment={endAdornment}>
        {children}
      </MenuItemContent>
    </BaseMenu.Item>
  );
});

export interface MenuLinkItemProps
  extends Omit<BaseMenu.LinkItem.Props, 'children'>,
    MenuItemContentProps {}

export const MenuLinkItem = forwardRef<Element, MenuLinkItemProps>(function MenuLinkItem(
  {children, icon, endAdornment, className, ...props},
  ref,
) {
  const surfaceClassName = useSurfaceClassName();
  return (
    <BaseMenu.LinkItem
      data-outline="box-small"
      data-outline-focus="none"
      {...props}
      ref={ref}
      className={mergeClassName<BaseMenu.LinkItem.State>(classes(styles.item, surfaceClassName), className)}
    >
      <MenuItemContent icon={icon} endAdornment={endAdornment}>
        {children}
      </MenuItemContent>
    </BaseMenu.LinkItem>
  );
});

export const MenuGroup = forwardRef<HTMLDivElement, MenuGroupProps>(function MenuGroup(
  {className, ...props},
  ref,
) {
  return (
    <BaseMenu.Group
      {...props}
      ref={ref}
      className={mergeClassName<BaseMenu.Group.State>(styles.group, className)}
    />
  );
});

export const MenuGroupLabel = forwardRef<HTMLDivElement, MenuGroupLabelProps>(
  function MenuGroupLabel({className, ...props}, ref) {
    return (
      <BaseMenu.GroupLabel
        {...props}
        ref={ref}
        className={mergeClassName<BaseMenu.GroupLabel.State>(styles.groupLabel, className)}
      />
    );
  },
);

export interface MenuSeparatorProps extends Omit<SeparatorProps, 'orientation'> {
  readonly orientation?: 'horizontal';
}

export const MenuSeparator = forwardRef<HTMLDivElement, MenuSeparatorProps>(
  function MenuSeparator(props, ref) {
    return <Separator {...props} ref={ref} orientation="horizontal" />;
  },
);

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
