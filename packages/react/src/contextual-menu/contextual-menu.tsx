import {Menu as BaseMenu} from '@base-ui/react/menu';
import {forwardRef, type ReactNode} from 'react';
import styles from './contextual-menu.module.css';
import {Separator} from '../separator/separator.tsx';
import {classes, mergeClassName} from '../utils/class-names.ts';

export type {
  MenuRootProps as ContextualMenuRootProps,
  MenuRootActions as ContextualMenuRootActions,
  MenuRootChangeEventReason as ContextualMenuRootChangeEventReason,
  MenuRootChangeEventDetails as ContextualMenuRootChangeEventDetails,
  MenuArrowState as ContextualMenuArrowState,
  MenuArrowProps as ContextualMenuArrowProps,
  MenuBackdropState as ContextualMenuBackdropState,
  MenuBackdropProps as ContextualMenuBackdropProps,
  MenuCheckboxItemState as ContextualMenuCheckboxItemState,
  MenuCheckboxItemChangeEventReason as ContextualMenuCheckboxItemChangeEventReason,
  MenuCheckboxItemChangeEventDetails as ContextualMenuCheckboxItemChangeEventDetails,
  MenuCheckboxItemIndicatorState as ContextualMenuCheckboxItemIndicatorState,
  MenuItemState as ContextualMenuItemState,
  MenuLinkItemState as ContextualMenuLinkItemState,
  MenuPopupState as ContextualMenuPopupState,
  MenuPortalProps as ContextualMenuPortalProps,
  MenuPositionerState as ContextualMenuPositionerState,
  MenuPositionerProps as ContextualMenuPositionerProps,
  MenuRadioGroupProps as ContextualMenuRadioGroupProps,
  MenuRadioGroupState as ContextualMenuRadioGroupState,
  MenuRadioGroupChangeEventReason as ContextualMenuRadioGroupChangeEventReason,
  MenuRadioGroupChangeEventDetails as ContextualMenuRadioGroupChangeEventDetails,
  MenuRadioItemState as ContextualMenuRadioItemState,
  MenuRadioItemIndicatorState as ContextualMenuRadioItemIndicatorState,
  MenuSubmenuRootProps as ContextualMenuSubmenuRootProps,
  MenuSubmenuRootChangeEventReason as ContextualMenuSubmenuRootChangeEventReason,
  MenuSubmenuRootChangeEventDetails as ContextualMenuSubmenuRootChangeEventDetails,
  MenuTriggerProps as ContextualMenuTriggerProps,
  MenuTriggerState as ContextualMenuTriggerState,
  MenuSubmenuTriggerState as ContextualMenuSubmenuTriggerState,
  MenuViewportState as ContextualMenuViewportState,
  MenuViewportProps as ContextualMenuViewportProps,
} from '@base-ui/react/menu';

export type ContextualMenuHandle<Payload = unknown> = BaseMenu.Handle<Payload>;

export type ContextualMenuPopupProps = BaseMenu.Popup.Props;
export type ContextualMenuGroupProps = BaseMenu.Group.Props;
export type ContextualMenuGroupLabelProps = BaseMenu.GroupLabel.Props;
export type ContextualMenuSubmenuTriggerProps = BaseMenu.SubmenuTrigger.Props;
export type ContextualMenuCheckboxItemProps = BaseMenu.CheckboxItem.Props;
export type ContextualMenuRadioItemProps = BaseMenu.RadioItem.Props;
export type ContextualMenuCheckboxItemIndicatorProps = BaseMenu.CheckboxItemIndicator.Props;
export type ContextualMenuRadioItemIndicatorProps = BaseMenu.RadioItemIndicator.Props;

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
      className={mergeClassName<BaseMenu.Item.State>(classes(styles.item, styles.composedItem), className)}
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
      className={mergeClassName<BaseMenu.LinkItem.State>(classes(styles.item, styles.composedItem), className)}
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

export const ContextualMenuSubmenuTrigger = forwardRef<HTMLElement, ContextualMenuSubmenuTriggerProps>(
  function ContextualMenuSubmenuTrigger({className, ...props}, ref) {
    return (
      <BaseMenu.SubmenuTrigger
        {...props}
        ref={ref}
        className={mergeClassName<BaseMenu.SubmenuTrigger.State>(
          classes(styles.item, styles.submenuTrigger),
          className,
        )}
      />
    );
  },
);

export const ContextualMenuCheckboxItem = forwardRef<HTMLElement, ContextualMenuCheckboxItemProps>(
  function ContextualMenuCheckboxItem({className, ...props}, ref) {
    return <BaseMenu.CheckboxItem {...props} ref={ref} className={mergeClassName<BaseMenu.CheckboxItem.State>(styles.item, className)} />;
  },
);

export const ContextualMenuRadioItem = forwardRef<HTMLElement, ContextualMenuRadioItemProps>(
  function ContextualMenuRadioItem({className, ...props}, ref) {
    return <BaseMenu.RadioItem {...props} ref={ref} className={mergeClassName<BaseMenu.RadioItem.State>(styles.item, className)} />;
  },
);

export const ContextualMenuCheckboxItemIndicator = forwardRef<HTMLSpanElement, ContextualMenuCheckboxItemIndicatorProps>(
  function ContextualMenuCheckboxItemIndicator({className, ...props}, ref) {
    return <BaseMenu.CheckboxItemIndicator {...props} ref={ref} className={mergeClassName<BaseMenu.CheckboxItemIndicator.State>(styles.indicator, className)} />;
  },
);

export const ContextualMenuRadioItemIndicator = forwardRef<HTMLSpanElement, ContextualMenuRadioItemIndicatorProps>(
  function ContextualMenuRadioItemIndicator({className, ...props}, ref) {
    return <BaseMenu.RadioItemIndicator {...props} ref={ref} className={mergeClassName<BaseMenu.RadioItemIndicator.State>(styles.indicator, className)} />;
  },
);

export const ContextualMenu = {
  Root: BaseMenu.Root,
  Backdrop: BaseMenu.Backdrop,
  Arrow: BaseMenu.Arrow,
  Viewport: BaseMenu.Viewport,
  RadioGroup: BaseMenu.RadioGroup,
  Handle: BaseMenu.Handle,
  Trigger: BaseMenu.Trigger,
  Portal: BaseMenu.Portal,
  Positioner: ContextualMenuPositioner,
  Popup: ContextualMenuPopup,
  Item: ContextualMenuItem,
  LinkItem: ContextualMenuLinkItem,
  CheckboxItem: ContextualMenuCheckboxItem,
  CheckboxItemIndicator: ContextualMenuCheckboxItemIndicator,
  RadioItem: ContextualMenuRadioItem,
  RadioItemIndicator: ContextualMenuRadioItemIndicator,
  Group: ContextualMenuGroup,
  GroupLabel: ContextualMenuGroupLabel,
  Separator,
  SubmenuRoot: BaseMenu.SubmenuRoot,
  SubmenuTrigger: ContextualMenuSubmenuTrigger,
  createHandle: BaseMenu.createHandle,
} as const;
