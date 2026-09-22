import {Menu as BaseMenu} from '@base-ui/react/menu';
import {forwardRef, type ReactNode} from 'react';
import styles from './contextual-menu.module.css';
import {Separator} from '../separator/separator.tsx';
import {mergeClassName} from '../utils/class-names.ts';

export type {
  MenuRootProps as ContextualMenuRootProps,
  MenuRootActions as ContextualMenuRootActions,
  MenuRootChangeEventReason as ContextualMenuRootChangeEventReason,
  MenuRootChangeEventDetails as ContextualMenuRootChangeEventDetails,
  MenuItemState as ContextualMenuItemState,
  MenuLinkItemState as ContextualMenuLinkItemState,
  MenuPopupState as ContextualMenuPopupState,
  MenuPortalProps as ContextualMenuPortalProps,
  MenuPositionerState as ContextualMenuPositionerState,
  MenuPositionerProps as ContextualMenuPositionerProps,
  MenuTriggerProps as ContextualMenuTriggerProps,
  MenuTriggerState as ContextualMenuTriggerState,
  MenuViewportState as ContextualMenuViewportState,
  MenuViewportProps as ContextualMenuViewportProps,
} from '@base-ui/react/menu';

export type ContextualMenuHandle<Payload = unknown> = BaseMenu.Handle<Payload>;

export type ContextualMenuPopupProps = BaseMenu.Popup.Props;
export type ContextualMenuGroupProps = BaseMenu.Group.Props;
export type ContextualMenuGroupLabelProps = BaseMenu.GroupLabel.Props;

export const ContextualMenuPositioner = BaseMenu.Positioner;

export const ContextualMenuPopup = forwardRef<HTMLDivElement, ContextualMenuPopupProps>(function ContextualMenuPopup(
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

interface ContextualMenuItemContentProps {
  readonly children?: ReactNode;
  readonly icon?: ReactNode;
  readonly endAdornment?: ReactNode;
}

function ContextualMenuItemContent({children, icon, endAdornment}: ContextualMenuItemContentProps): React.JSX.Element {
  return (
    <>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <span className={styles.label}>{children}</span>
      {endAdornment ? <span className={styles.icon}>{endAdornment}</span> : null}
    </>
  );
}

export interface ContextualMenuItemProps
  extends Omit<BaseMenu.Item.Props, 'children'>,
    ContextualMenuItemContentProps {}

export const ContextualMenuItem = forwardRef<HTMLElement, ContextualMenuItemProps>(function ContextualMenuItem(
  {children, icon, endAdornment, className, ...props},
  ref,
) {
  return (
    <BaseMenu.Item
      {...props}
      ref={ref}
      className={mergeClassName<BaseMenu.Item.State>(styles.item, className)}
    >
      <ContextualMenuItemContent icon={icon} endAdornment={endAdornment}>
        {children}
      </ContextualMenuItemContent>
    </BaseMenu.Item>
  );
});

export interface ContextualMenuLinkItemProps
  extends Omit<BaseMenu.LinkItem.Props, 'children'>,
    ContextualMenuItemContentProps {}

export const ContextualMenuLinkItem = forwardRef<Element, ContextualMenuLinkItemProps>(function ContextualMenuLinkItem(
  {children, icon, endAdornment, className, ...props},
  ref,
) {
  return (
    <BaseMenu.LinkItem
      {...props}
      ref={ref}
      className={mergeClassName<BaseMenu.LinkItem.State>(styles.item, className)}
    >
      <ContextualMenuItemContent icon={icon} endAdornment={endAdornment}>
        {children}
      </ContextualMenuItemContent>
    </BaseMenu.LinkItem>
  );
});

export const ContextualMenuGroup = forwardRef<HTMLDivElement, ContextualMenuGroupProps>(function ContextualMenuGroup(
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

export const ContextualMenuGroupLabel = forwardRef<HTMLDivElement, ContextualMenuGroupLabelProps>(
  function ContextualMenuGroupLabel({className, ...props}, ref) {
    return (
      <BaseMenu.GroupLabel
        {...props}
        ref={ref}
        className={mergeClassName<BaseMenu.GroupLabel.State>(styles.groupLabel, className)}
      />
    );
  },
);

export const ContextualMenu = {
  Root: BaseMenu.Root,
  Viewport: BaseMenu.Viewport,
  Handle: BaseMenu.Handle,
  Trigger: BaseMenu.Trigger,
  Portal: BaseMenu.Portal,
  Positioner: ContextualMenuPositioner,
  Popup: ContextualMenuPopup,
  Item: ContextualMenuItem,
  LinkItem: ContextualMenuLinkItem,
  Group: ContextualMenuGroup,
  GroupLabel: ContextualMenuGroupLabel,
  Separator,
  createHandle: BaseMenu.createHandle,
} as const;
