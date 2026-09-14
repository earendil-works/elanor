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
  MenuCheckboxItemProps as ContextualMenuCheckboxItemProps,
  MenuCheckboxItemChangeEventReason as ContextualMenuCheckboxItemChangeEventReason,
  MenuCheckboxItemChangeEventDetails as ContextualMenuCheckboxItemChangeEventDetails,
  MenuCheckboxItemIndicatorProps as ContextualMenuCheckboxItemIndicatorProps,
  MenuCheckboxItemIndicatorState as ContextualMenuCheckboxItemIndicatorState,
  MenuGroupLabelProps as ContextualMenuGroupLabelProps,
  MenuGroupLabelState as ContextualMenuGroupLabelState,
  MenuGroupProps as ContextualMenuGroupProps,
  MenuGroupState as ContextualMenuGroupState,
  MenuItemState as ContextualMenuItemState,
  MenuLinkItemState as ContextualMenuLinkItemState,
  MenuPopupProps as ContextualMenuPopupProps,
  MenuPopupState as ContextualMenuPopupState,
  MenuPortalState as ContextualMenuPortalState,
  MenuPortalProps as ContextualMenuPortalProps,
  MenuPositionerState as ContextualMenuPositionerState,
  MenuPositionerProps as ContextualMenuPositionerProps,
  MenuRadioGroupProps as ContextualMenuRadioGroupProps,
  MenuRadioGroupState as ContextualMenuRadioGroupState,
  MenuRadioGroupChangeEventReason as ContextualMenuRadioGroupChangeEventReason,
  MenuRadioGroupChangeEventDetails as ContextualMenuRadioGroupChangeEventDetails,
  MenuRadioItemState as ContextualMenuRadioItemState,
  MenuRadioItemProps as ContextualMenuRadioItemProps,
  MenuRadioItemIndicatorProps as ContextualMenuRadioItemIndicatorProps,
  MenuRadioItemIndicatorState as ContextualMenuRadioItemIndicatorState,
  MenuSubmenuRootProps as ContextualMenuSubmenuRootProps,
  MenuSubmenuRootChangeEventReason as ContextualMenuSubmenuRootChangeEventReason,
  MenuSubmenuRootChangeEventDetails as ContextualMenuSubmenuRootChangeEventDetails,
  MenuTriggerProps as ContextualMenuTriggerProps,
  MenuTriggerState as ContextualMenuTriggerState,
  MenuSubmenuTriggerState as ContextualMenuSubmenuTriggerState,
  MenuSubmenuTriggerProps as ContextualMenuSubmenuTriggerProps,
  MenuViewportState as ContextualMenuViewportState,
  MenuViewportProps as ContextualMenuViewportProps,
} from '@base-ui/react/menu';

export type ContextualMenuHandle<Payload = unknown> = BaseMenu.Handle<Payload>;

export const ContextualMenuPositioner = BaseMenu.Positioner;

export const ContextualMenuPopup = forwardRef<HTMLDivElement, BaseMenu.Popup.Props>(function ContextualMenuPopup(
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

export const ContextualMenuGroup = forwardRef<HTMLDivElement, BaseMenu.Group.Props>(function ContextualMenuGroup(
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

export const ContextualMenuGroupLabel = forwardRef<HTMLDivElement, BaseMenu.GroupLabel.Props>(
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

export const ContextualMenuSubmenuTrigger = forwardRef<HTMLElement, BaseMenu.SubmenuTrigger.Props>(
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

export const ContextualMenuCheckboxItem = forwardRef<HTMLElement, BaseMenu.CheckboxItem.Props>(
  function ContextualMenuCheckboxItem({className, ...props}, ref) {
    return <BaseMenu.CheckboxItem {...props} ref={ref} className={mergeClassName<BaseMenu.CheckboxItem.State>(styles.item, className)} />;
  },
);

export const ContextualMenuRadioItem = forwardRef<HTMLElement, BaseMenu.RadioItem.Props>(
  function ContextualMenuRadioItem({className, ...props}, ref) {
    return <BaseMenu.RadioItem {...props} ref={ref} className={mergeClassName<BaseMenu.RadioItem.State>(styles.item, className)} />;
  },
);

export const ContextualMenuCheckboxItemIndicator = forwardRef<HTMLSpanElement, BaseMenu.CheckboxItemIndicator.Props>(
  function ContextualMenuCheckboxItemIndicator({className, ...props}, ref) {
    return <BaseMenu.CheckboxItemIndicator {...props} ref={ref} className={mergeClassName<BaseMenu.CheckboxItemIndicator.State>(styles.indicator, className)} />;
  },
);

export const ContextualMenuRadioItemIndicator = forwardRef<HTMLSpanElement, BaseMenu.RadioItemIndicator.Props>(
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
