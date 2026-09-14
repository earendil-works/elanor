import {Select as BaseSelect} from '@base-ui/react/select';
import {forwardRef} from 'react';
import styles from './dropdown.module.css';
import {mergeClassName} from '../utils/class-names.ts';

export type {
  SelectRootProps as DropdownRootProps,
  SelectRootActions as DropdownRootActions,
  SelectRootChangeEventReason as DropdownRootChangeEventReason,
  SelectRootChangeEventDetails as DropdownRootChangeEventDetails,
  SelectLabelState as DropdownLabelState,
  SelectLabelProps as DropdownLabelProps,
  SelectTriggerState as DropdownTriggerState,
  SelectTriggerProps as DropdownTriggerProps,
  SelectValueState as DropdownValueState,
  SelectValueProps as DropdownValueProps,
  SelectIconState as DropdownIconState,
  SelectIconProps as DropdownIconProps,
  SelectPortalState as DropdownPortalState,
  SelectPortalProps as DropdownPortalProps,
  SelectBackdropState as DropdownBackdropState,
  SelectBackdropProps as DropdownBackdropProps,
  SelectPositionerState as DropdownPositionerState,
  SelectPositionerProps as DropdownPositionerProps,
  SelectPopupProps as DropdownPopupProps,
  SelectPopupState as DropdownPopupState,
  SelectListProps as DropdownListProps,
  SelectListState as DropdownListState,
  SelectItemState as DropdownItemState,
  SelectItemProps as DropdownItemProps,
  SelectItemIndicatorState as DropdownItemIndicatorState,
  SelectItemIndicatorProps as DropdownItemIndicatorProps,
  SelectItemTextState as DropdownItemTextState,
  SelectItemTextProps as DropdownItemTextProps,
  SelectArrowState as DropdownArrowState,
  SelectArrowProps as DropdownArrowProps,
  SelectScrollDownArrowState as DropdownScrollDownArrowState,
  SelectScrollDownArrowProps as DropdownScrollDownArrowProps,
  SelectScrollUpArrowState as DropdownScrollUpArrowState,
  SelectScrollUpArrowProps as DropdownScrollUpArrowProps,
  SelectGroupState as DropdownGroupState,
  SelectGroupProps as DropdownGroupProps,
  SelectGroupLabelState as DropdownGroupLabelState,
  SelectGroupLabelProps as DropdownGroupLabelProps,
  SelectSeparatorProps as DropdownSeparatorProps,
  SelectSeparatorState as DropdownSeparatorState,
} from '@base-ui/react/select';

export const DropdownTrigger = forwardRef<HTMLButtonElement, BaseSelect.Trigger.Props>(
  function DropdownTrigger({className, ...props}, ref) {
    return (
      <BaseSelect.Trigger
        {...props}
        ref={ref}
        className={mergeClassName<BaseSelect.Trigger.State>(styles.trigger, className)}
      />
    );
  },
);

export const DropdownIcon = forwardRef<HTMLSpanElement, BaseSelect.Icon.Props>(
  function DropdownIcon({className, children, ...props}, ref) {
    return (
      <BaseSelect.Icon
        {...props}
        ref={ref}
        className={mergeClassName<BaseSelect.Icon.State>(styles.icon, className)}
      >
        {children ?? <span className={styles.chevron} />}
      </BaseSelect.Icon>
    );
  },
);

export const DropdownPopup = forwardRef<HTMLDivElement, BaseSelect.Popup.Props>(
  function DropdownPopup({className, ...props}, ref) {
    return (
      <BaseSelect.Popup
        {...props}
        ref={ref}
        className={mergeClassName<BaseSelect.Popup.State>(styles.popup, className)}
      />
    );
  },
);

export const DropdownList = forwardRef<HTMLDivElement, BaseSelect.List.Props>(
  function DropdownList({className, ...props}, ref) {
    return (
      <BaseSelect.List
        {...props}
        ref={ref}
        className={mergeClassName<BaseSelect.List.State>(styles.list, className)}
      />
    );
  },
);

export const DropdownItem = forwardRef<HTMLElement, BaseSelect.Item.Props>(
  function DropdownItem({className, ...props}, ref) {
    return (
      <BaseSelect.Item
        {...props}
        ref={ref}
        className={mergeClassName<BaseSelect.Item.State>(styles.item, className)}
      />
    );
  },
);

export const DropdownItemIndicator = forwardRef<HTMLSpanElement, BaseSelect.ItemIndicator.Props>(
  function DropdownItemIndicator({className, ...props}, ref) {
    return (
      <BaseSelect.ItemIndicator
        {...props}
        ref={ref}
        className={mergeClassName<BaseSelect.ItemIndicator.State>(styles.itemIndicator, className)}
      />
    );
  },
);

export const DropdownGroupLabel = forwardRef<HTMLDivElement, BaseSelect.GroupLabel.Props>(
  function DropdownGroupLabel({className, ...props}, ref) {
    return (
      <BaseSelect.GroupLabel
        {...props}
        ref={ref}
        className={mergeClassName<BaseSelect.GroupLabel.State>(styles.groupLabel, className)}
      />
    );
  },
);

export const DropdownSeparator = forwardRef<HTMLDivElement, BaseSelect.Separator.Props>(
  function DropdownSeparator({className, ...props}, ref) {
    return (
      <BaseSelect.Separator
        {...props}
        ref={ref}
        className={mergeClassName<BaseSelect.Separator.State>(styles.separator, className)}
      />
    );
  },
);

export const Dropdown = {
  Root: BaseSelect.Root,
  Label: BaseSelect.Label,
  Trigger: DropdownTrigger,
  Value: BaseSelect.Value,
  Icon: DropdownIcon,
  Portal: BaseSelect.Portal,
  Backdrop: BaseSelect.Backdrop,
  Positioner: BaseSelect.Positioner,
  Popup: DropdownPopup,
  List: DropdownList,
  Item: DropdownItem,
  ItemIndicator: DropdownItemIndicator,
  ItemText: BaseSelect.ItemText,
  Arrow: BaseSelect.Arrow,
  ScrollDownArrow: BaseSelect.ScrollDownArrow,
  ScrollUpArrow: BaseSelect.ScrollUpArrow,
  Group: BaseSelect.Group,
  GroupLabel: DropdownGroupLabel,
  Separator: DropdownSeparator,
} as const;
