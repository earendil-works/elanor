import {Menu as BaseMenu} from '@base-ui/react/menu';
import type {ComponentPropsWithRef, ReactNode} from 'react';

import {Separator, type SeparatorProps} from '../separator/separator.tsx';
import {mergeClassName} from '../utils/class-names.ts';

import styles from './menu.module.css';

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

export function MenuPopup({ref, className, ...props}: MenuPopupProps) {
  return (
    <BaseMenu.Popup
      {...props}
      ref={ref}
      className={mergeClassName<BaseMenu.Popup.State>(styles.popup, className)}
    />
  );
}

interface MenuItemContentProps {
  /** The item label. */
  readonly children?: ReactNode;
  /** Decorative icon before the label. */
  readonly icon?: ReactNode;
  /** Content after the label, such as an icon. */
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

export type MenuItemSemantic = 'neutral' | 'negative';

export interface MenuItemProps
  extends Omit<ComponentPropsWithRef<typeof BaseMenu.Item>, 'children'>, MenuItemContentProps {
  /** `negative` for destructive actions, such as delete or remove. */
  readonly semantic?: MenuItemSemantic;
}

export function MenuItem({
  ref,
  children,
  icon,
  endAdornment,
  semantic = 'neutral',
  className,
  ...props
}: MenuItemProps) {
  return (
    <BaseMenu.Item
      {...props}
      ref={ref}
      data-semantic={semantic}
      className={mergeClassName<BaseMenu.Item.State>(styles.item, className)}
    >
      <MenuItemContent icon={icon} endAdornment={endAdornment}>
        {children}
      </MenuItemContent>
    </BaseMenu.Item>
  );
}

export interface MenuLinkItemProps
  extends Omit<ComponentPropsWithRef<typeof BaseMenu.LinkItem>, 'children'>, MenuItemContentProps {}

export function MenuLinkItem({
  ref,
  children,
  icon,
  endAdornment,
  className,
  ...props
}: MenuLinkItemProps) {
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
}

export function MenuGroup({ref, className, ...props}: MenuGroupProps) {
  return (
    <BaseMenu.Group
      {...props}
      ref={ref}
      className={mergeClassName<BaseMenu.Group.State>(styles.group, className)}
    />
  );
}

export function MenuGroupLabel({ref, className, ...props}: MenuGroupLabelProps) {
  return (
    <BaseMenu.GroupLabel
      {...props}
      ref={ref}
      className={mergeClassName<BaseMenu.GroupLabel.State>(styles.groupLabel, className)}
    />
  );
}

export interface MenuSeparatorProps extends Omit<SeparatorProps, 'orientation'> {
  /** Only horizontal is supported. */
  readonly orientation?: 'horizontal';
}

export function MenuSeparator({ref, ...props}: MenuSeparatorProps) {
  return <Separator {...props} ref={ref} orientation="horizontal" />;
}
