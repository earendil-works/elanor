import {Combobox as BaseCombobox} from '@base-ui/react/combobox';
import {forwardRef} from 'react';
import styles from './searchable-dropdown.module.css';
import {mergeClassName} from '../utils/class-names.ts';

export type {
  ComboboxTriggerState as SearchableDropdownTriggerState,
  ComboboxPopupState as SearchableDropdownPopupState,
  ComboboxInputGroupState as SearchableDropdownInputGroupState,
  ComboboxInputState as SearchableDropdownInputState,
  ComboboxListState as SearchableDropdownListState,
  ComboboxItemState as SearchableDropdownItemState,
  ComboboxItemIndicatorState as SearchableDropdownItemIndicatorState,
  ComboboxSeparatorState as SearchableDropdownSeparatorState,
  ComboboxLabelProps as SearchableDropdownLabelProps,
  ComboboxLabelState as SearchableDropdownLabelState,
  ComboboxValueProps as SearchableDropdownValueProps,
  ComboboxPortalProps as SearchableDropdownPortalProps,
  ComboboxPositionerProps as SearchableDropdownPositionerProps,
  ComboboxPositionerState as SearchableDropdownPositionerState,
  ComboboxGroupProps as SearchableDropdownGroupProps,
  ComboboxRowProps as SearchableDropdownRowProps,
  ComboboxStatusProps as SearchableDropdownStatusProps,
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

export type SearchableDropdownTriggerProps = BaseCombobox.Trigger.Props;
export type SearchableDropdownIconProps = BaseCombobox.Icon.Props;
export type SearchableDropdownPopupProps = BaseCombobox.Popup.Props;
export type SearchableDropdownInputGroupProps = BaseCombobox.InputGroup.Props;
const inputTypes = ['text', 'search'] as const;

export interface SearchableDropdownInputProps extends Omit<BaseCombobox.Input.Props, 'type'> {
  readonly type?: (typeof inputTypes)[number];
}

export type SearchableDropdownListProps = BaseCombobox.List.Props;
export type SearchableDropdownItemProps = BaseCombobox.Item.Props;
export type SearchableDropdownItemIndicatorProps = BaseCombobox.ItemIndicator.Props;
export type SearchableDropdownGroupLabelProps = BaseCombobox.GroupLabel.Props;
export interface SearchableDropdownSeparatorProps extends Omit<BaseCombobox.Separator.Props, 'orientation'> {
  readonly orientation?: 'horizontal';
}
export type SearchableDropdownEmptyProps = BaseCombobox.Empty.Props;

export const SearchableDropdownTrigger = forwardRef<HTMLButtonElement, SearchableDropdownTriggerProps>(
  function SearchableDropdownTrigger({className, ...props}, ref) {
    return (
      <BaseCombobox.Trigger
        {...props}
        ref={ref}
        className={mergeClassName<BaseCombobox.Trigger.State>(styles.trigger, className)}
      />
    );
  },
);

export const SearchableDropdownIcon = forwardRef<HTMLSpanElement, SearchableDropdownIconProps>(
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

export const SearchableDropdownPopup = forwardRef<HTMLDivElement, SearchableDropdownPopupProps>(
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

export const SearchableDropdownInputGroup = forwardRef<HTMLDivElement, SearchableDropdownInputGroupProps>(
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

export const SearchableDropdownInput = forwardRef<HTMLInputElement, SearchableDropdownInputProps>(
  function SearchableDropdownInput({className, type = 'text', ...props}, ref) {
    if (!inputTypes.includes(type)) {
      throw new TypeError(`SearchableDropdown.Input does not support type="${type}". Use one of: ${inputTypes.join(', ')}.`);
    }

    return (
      <BaseCombobox.Input
        {...props}
        ref={ref}
        type={type}
        className={mergeClassName<BaseCombobox.Input.State>(styles.input, className)}
      />
    );
  },
);

export const SearchableDropdownList = forwardRef<HTMLDivElement, SearchableDropdownListProps>(
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

export const SearchableDropdownItem = forwardRef<HTMLDivElement, SearchableDropdownItemProps>(
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

export const SearchableDropdownItemIndicator = forwardRef<HTMLSpanElement, SearchableDropdownItemIndicatorProps>(
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

export const SearchableDropdownGroupLabel = forwardRef<HTMLDivElement, SearchableDropdownGroupLabelProps>(
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

export const SearchableDropdownSeparator = forwardRef<HTMLDivElement, SearchableDropdownSeparatorProps>(
  function SearchableDropdownSeparator({className, ...props}, ref) {
    return (
      <BaseCombobox.Separator
        {...props}
        ref={ref}
        orientation="horizontal"
        className={mergeClassName<BaseCombobox.Separator.State>(styles.separator, className)}
      />
    );
  },
);

export const SearchableDropdownEmpty = forwardRef<HTMLDivElement, SearchableDropdownEmptyProps>(
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
  Positioner: BaseCombobox.Positioner,
  Popup: SearchableDropdownPopup,
  InputGroup: SearchableDropdownInputGroup,
  Input: SearchableDropdownInput,
  List: SearchableDropdownList,
  Item: SearchableDropdownItem,
  ItemIndicator: SearchableDropdownItemIndicator,
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
