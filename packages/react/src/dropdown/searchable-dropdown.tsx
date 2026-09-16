import {Combobox as BaseCombobox} from '@base-ui/react/combobox';
import {forwardRef} from 'react';
import styles from './searchable-dropdown.module.css';
import {useBrushVariant} from '../brush-border/use-brush-variant.ts';
import {mergeClassName} from '../utils/class-names.ts';

export type {
  ComboboxTriggerProps as SearchableDropdownTriggerProps,
  ComboboxTriggerState as SearchableDropdownTriggerState,
  ComboboxIconProps as SearchableDropdownIconProps,
  ComboboxIconState as SearchableDropdownIconState,
  ComboboxPopupProps as SearchableDropdownPopupProps,
  ComboboxPopupState as SearchableDropdownPopupState,
  ComboboxInputGroupProps as SearchableDropdownInputGroupProps,
  ComboboxInputGroupState as SearchableDropdownInputGroupState,
  ComboboxInputProps as SearchableDropdownInputProps,
  ComboboxInputState as SearchableDropdownInputState,
  ComboboxListProps as SearchableDropdownListProps,
  ComboboxListState as SearchableDropdownListState,
  ComboboxItemProps as SearchableDropdownItemProps,
  ComboboxItemState as SearchableDropdownItemState,
  ComboboxItemIndicatorProps as SearchableDropdownItemIndicatorProps,
  ComboboxItemIndicatorState as SearchableDropdownItemIndicatorState,
  ComboboxGroupLabelProps as SearchableDropdownGroupLabelProps,
  ComboboxGroupLabelState as SearchableDropdownGroupLabelState,
  ComboboxSeparatorProps as SearchableDropdownSeparatorProps,
  ComboboxSeparatorState as SearchableDropdownSeparatorState,
  ComboboxEmptyProps as SearchableDropdownEmptyProps,
  ComboboxEmptyState as SearchableDropdownEmptyState,
  ComboboxLabelProps as SearchableDropdownLabelProps,
  ComboboxLabelState as SearchableDropdownLabelState,
  ComboboxValueProps as SearchableDropdownValueProps,
  ComboboxValueState as SearchableDropdownValueState,
  ComboboxPortalProps as SearchableDropdownPortalProps,
  ComboboxPortalState as SearchableDropdownPortalState,
  ComboboxBackdropProps as SearchableDropdownBackdropProps,
  ComboboxBackdropState as SearchableDropdownBackdropState,
  ComboboxPositionerProps as SearchableDropdownPositionerProps,
  ComboboxPositionerState as SearchableDropdownPositionerState,
  ComboboxArrowProps as SearchableDropdownArrowProps,
  ComboboxArrowState as SearchableDropdownArrowState,
  ComboboxGroupProps as SearchableDropdownGroupProps,
  ComboboxGroupState as SearchableDropdownGroupState,
  ComboboxRowProps as SearchableDropdownRowProps,
  ComboboxRowState as SearchableDropdownRowState,
  ComboboxStatusProps as SearchableDropdownStatusProps,
  ComboboxStatusState as SearchableDropdownStatusState,
  ComboboxRootProps as SearchableDropdownRootProps,
  ComboboxRootState as SearchableDropdownRootState,
  ComboboxRootActions as SearchableDropdownRootActions,
  ComboboxRootChangeEventReason as SearchableDropdownRootChangeEventReason,
  ComboboxRootChangeEventDetails as SearchableDropdownRootChangeEventDetails,
  ComboboxRootHighlightEventReason as SearchableDropdownRootHighlightEventReason,
  ComboboxRootHighlightEventDetails as SearchableDropdownRootHighlightEventDetails,
  ComboboxCollectionProps as SearchableDropdownCollectionProps,
  ComboboxFilter as SearchableDropdownFilter,
  ComboboxFilterOptions as SearchableDropdownFilterOptions,
  ComboboxPrimitiveValue as SearchableDropdownPrimitiveValue,
  ComboboxItemCollection as SearchableDropdownItemCollection,
  CreateComboboxItemsOptions as CreateSearchableDropdownItemsOptions,
} from '@base-ui/react/combobox';

export const SearchableDropdownTrigger = forwardRef<HTMLButtonElement, BaseCombobox.Trigger.Props>(
  function SearchableDropdownTrigger({className, ...props}, ref) {
    return (
      <BaseCombobox.Trigger
        data-brush-variant={useBrushVariant()}
        {...props}
        ref={ref}
        className={mergeClassName<BaseCombobox.Trigger.State>(styles.trigger, className)}
      />
    );
  },
);

export const SearchableDropdownIcon = forwardRef<HTMLSpanElement, BaseCombobox.Icon.Props>(
  function SearchableDropdownIcon({className, children, ...props}, ref) {
    return (
      <BaseCombobox.Icon
        {...props}
        ref={ref}
        className={mergeClassName<BaseCombobox.Icon.State>(styles.icon, className)}
      >
        {children ?? <span className={styles.chevron} />}
      </BaseCombobox.Icon>
    );
  },
);

export const SearchableDropdownPopup = forwardRef<HTMLDivElement, BaseCombobox.Popup.Props>(
  function SearchableDropdownPopup({className, ...props}, ref) {
    return (
      <BaseCombobox.Popup
        {...props}
        ref={ref}
        className={mergeClassName<BaseCombobox.Popup.State>(styles.popup, className)}
      />
    );
  },
);

export const SearchableDropdownInputGroup = forwardRef<HTMLDivElement, BaseCombobox.InputGroup.Props>(
  function SearchableDropdownInputGroup({className, children, ...props}, ref) {
    return (
      <BaseCombobox.InputGroup
        {...props}
        ref={ref}
        className={mergeClassName<BaseCombobox.InputGroup.State>(styles.inputGroup, className)}
      >
        <span className={styles.searchIcon} aria-hidden="true">
          <span className={styles.searchGlyph} />
        </span>
        {children}
      </BaseCombobox.InputGroup>
    );
  },
);

export const SearchableDropdownInput = forwardRef<HTMLInputElement, BaseCombobox.Input.Props>(
  function SearchableDropdownInput({className, ...props}, ref) {
    return (
      <BaseCombobox.Input
        {...props}
        ref={ref}
        className={mergeClassName<BaseCombobox.Input.State>(styles.input, className)}
      />
    );
  },
);

export const SearchableDropdownList = forwardRef<HTMLDivElement, BaseCombobox.List.Props>(
  function SearchableDropdownList({className, ...props}, ref) {
    return (
      <BaseCombobox.List
        {...props}
        ref={ref}
        className={mergeClassName<BaseCombobox.List.State>(styles.list, className)}
      />
    );
  },
);

export const SearchableDropdownItem = forwardRef<HTMLDivElement, BaseCombobox.Item.Props>(
  function SearchableDropdownItem({className, ...props}, ref) {
    return (
      <BaseCombobox.Item
        {...props}
        ref={ref}
        className={mergeClassName<BaseCombobox.Item.State>(styles.item, className)}
      />
    );
  },
);

export const SearchableDropdownItemIndicator = forwardRef<HTMLSpanElement, BaseCombobox.ItemIndicator.Props>(
  function SearchableDropdownItemIndicator({className, children = null, ...props}, ref) {
    return (
      <BaseCombobox.ItemIndicator
        {...props}
        ref={ref}
        className={mergeClassName<BaseCombobox.ItemIndicator.State>(styles.itemIndicator, className)}
      >
        {children}
      </BaseCombobox.ItemIndicator>
    );
  },
);

export const SearchableDropdownGroupLabel = forwardRef<HTMLDivElement, BaseCombobox.GroupLabel.Props>(
  function SearchableDropdownGroupLabel({className, ...props}, ref) {
    return (
      <BaseCombobox.GroupLabel
        {...props}
        ref={ref}
        className={mergeClassName<BaseCombobox.GroupLabel.State>(styles.groupLabel, className)}
      />
    );
  },
);

export const SearchableDropdownSeparator = forwardRef<HTMLDivElement, BaseCombobox.Separator.Props>(
  function SearchableDropdownSeparator({className, ...props}, ref) {
    return (
      <BaseCombobox.Separator
        data-brush-variant={useBrushVariant()}
        {...props}
        ref={ref}
        className={mergeClassName<BaseCombobox.Separator.State>(styles.separator, className)}
      />
    );
  },
);

export const SearchableDropdownEmpty = forwardRef<HTMLDivElement, BaseCombobox.Empty.Props>(
  function SearchableDropdownEmpty({className, ...props}, ref) {
    return (
      <BaseCombobox.Empty
        {...props}
        ref={ref}
        className={mergeClassName<BaseCombobox.Empty.State>(styles.empty, className)}
      />
    );
  },
);

export const SearchableDropdown = {
  Root: BaseCombobox.Root,
  Label: BaseCombobox.Label,
  Trigger: SearchableDropdownTrigger,
  Value: BaseCombobox.Value,
  Icon: SearchableDropdownIcon,
  Portal: BaseCombobox.Portal,
  Backdrop: BaseCombobox.Backdrop,
  Positioner: BaseCombobox.Positioner,
  Popup: SearchableDropdownPopup,
  InputGroup: SearchableDropdownInputGroup,
  Input: SearchableDropdownInput,
  List: SearchableDropdownList,
  Item: SearchableDropdownItem,
  ItemIndicator: SearchableDropdownItemIndicator,
  Arrow: BaseCombobox.Arrow,
  Group: BaseCombobox.Group,
  GroupLabel: SearchableDropdownGroupLabel,
  Separator: SearchableDropdownSeparator,
  Empty: SearchableDropdownEmpty,
  Collection: BaseCombobox.Collection,
  Row: BaseCombobox.Row,
  Status: BaseCombobox.Status,
  useFilter: BaseCombobox.useFilter,
  useFilteredItems: BaseCombobox.useFilteredItems,
  createItems: BaseCombobox.createItems,
} as const;
