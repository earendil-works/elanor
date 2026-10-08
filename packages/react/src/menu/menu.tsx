import {Menu as BaseMenu} from '@base-ui/react/menu';
import {forwardRef, type ReactNode} from 'react';
import styles from './menu.module.css';
import {Separator, type SeparatorProps} from '../separator/separator.tsx';
import {mergeClassName} from '../utils/class-names.ts';

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

export type MenuPopupProps = BaseMenu.Popup.Props;
export type MenuGroupProps = BaseMenu.Group.Props;
export type MenuGroupLabelProps = BaseMenu.GroupLabel.Props;

export const MenuPositioner = BaseMenu.Positioner;

export const MenuPopup = forwardRef<HTMLDivElement, MenuPopupProps>(function MenuPopup(
  {className, ...props},
  ref,
) {
  return (
    <BaseMenu.Popup
      {...props}
      ref={ref}
      className={mergeClassName<BaseMenu.Popup.State>(styles.popup, className)}
    />
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
  return (
    <BaseMenu.Item
      {...props}
      ref={ref}
      className={mergeClassName<BaseMenu.Item.State>(styles.item, className)}
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
  return (
    <BaseMenu.LinkItem
      {...props}
      ref={ref}
      className={mergeClassName<BaseMenu.LinkItem.State>(styles.item, className)}
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
