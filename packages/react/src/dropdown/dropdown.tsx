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
  SelectValueState as DropdownValueState,
  SelectValueProps as DropdownValueProps,
  SelectIconState as DropdownIconState,
  SelectPortalProps as DropdownPortalProps,
  SelectPositionerState as DropdownPositionerState,
  SelectPositionerProps as DropdownPositionerProps,
  SelectPopupState as DropdownPopupState,
  SelectItemState as DropdownItemState,
  SelectItemIndicatorState as DropdownItemIndicatorState,
  SelectItemTextProps as DropdownItemTextProps,
  SelectGroupProps as DropdownGroupProps,
  SelectSeparatorState as DropdownSeparatorState,
} from '@base-ui/react/select';

export type DropdownTriggerProps = BaseSelect.Trigger.Props;
export type DropdownIconProps = BaseSelect.Icon.Props;
export type DropdownPopupProps = BaseSelect.Popup.Props;
export type DropdownListProps = BaseSelect.List.Props;
export type DropdownItemProps = BaseSelect.Item.Props;
export type DropdownItemIndicatorProps = BaseSelect.ItemIndicator.Props;
export type DropdownGroupLabelProps = BaseSelect.GroupLabel.Props;
export interface DropdownSeparatorProps extends Omit<BaseSelect.Separator.Props, 'orientation'> {
  readonly orientation?: 'horizontal';
}

export const DropdownTrigger = forwardRef<HTMLButtonElement, DropdownTriggerProps>(
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

export const DropdownIcon = forwardRef<HTMLSpanElement, DropdownIconProps>(
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

export const DropdownPopup = forwardRef<HTMLDivElement, DropdownPopupProps>(
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

export const DropdownList = forwardRef<HTMLDivElement, DropdownListProps>(
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

export const DropdownItem = forwardRef<HTMLElement, DropdownItemProps>(
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

export const DropdownItemIndicator = forwardRef<HTMLSpanElement, DropdownItemIndicatorProps>(
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

export const DropdownGroupLabel = forwardRef<HTMLDivElement, DropdownGroupLabelProps>(
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

export const DropdownSeparator = forwardRef<HTMLDivElement, DropdownSeparatorProps>(
  function DropdownSeparator({className, ...props}, ref) {
    return (
      <BaseSelect.Separator
        {...props}
        ref={ref}
        orientation="horizontal"
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
  Positioner: BaseSelect.Positioner,
  Popup: DropdownPopup,
  List: DropdownList,
  Item: DropdownItem,
  ItemIndicator: DropdownItemIndicator,
  ItemText: BaseSelect.ItemText,
  Group: BaseSelect.Group,
  GroupLabel: DropdownGroupLabel,
  Separator: DropdownSeparator,
} as const;
