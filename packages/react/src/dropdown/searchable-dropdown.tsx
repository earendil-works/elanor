import {Combobox as BaseCombobox} from '@base-ui/react/combobox';
import {KeyboardArrowDownIcon, SearchIcon} from '@earendil-works/elanor-icons-react';
import {createContext, useContext, type PointerEventHandler, type Ref} from 'react';

import {classes, mergeClassName} from '../utils/class-names.ts';
import {useMergedRef} from '../utils/refs.ts';
import {
  ClearContext,
  useClearableValue,
  useClearContext,
  type DropdownRootChangedValue,
  type DropdownClearProps,
  type DropdownControlProps,
  type DropdownValueCountProps,
} from './dropdown-control.tsx';
import type {DropdownTriggerDensity} from './dropdown.tsx';

import styles from './searchable-dropdown.module.css';

export type {
  ComboboxTriggerState as SearchableDropdownTriggerState,
  ComboboxPopupState as SearchableDropdownPopupState,
  ComboboxInputGroupState as SearchableDropdownInputGroupState,
  ComboboxInputState as SearchableDropdownInputState,
  ComboboxListState as SearchableDropdownListState,
  ComboboxItemState as SearchableDropdownItemState,
  ComboboxItemIndicatorState as SearchableDropdownItemIndicatorState,
  ComboboxSeparatorState as SearchableDropdownSeparatorState,
  ComboboxLabelState as SearchableDropdownLabelState,
  ComboboxValueProps as SearchableDropdownValueProps,
  ComboboxPortalProps as SearchableDropdownPortalProps,
  ComboboxPositionerProps as SearchableDropdownPositionerProps,
  ComboboxPositionerState as SearchableDropdownPositionerState,
  ComboboxGroupProps as SearchableDropdownGroupProps,
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

export type SearchableDropdownRootProps<
  Value,
  Multiple extends boolean | undefined = false,
  Item = Value,
> = BaseCombobox.Root.Props<Value, Multiple, Item> & {
  /** Only list navigation is supported; grid layouts are not. */
  readonly grid?: false;
};

export type SearchableDropdownLabelProps = BaseCombobox.Label.Props;
export interface SearchableDropdownPrefixProps extends Omit<
  BaseCombobox.Label.Props,
  'ref' | 'render' | 'onPointerDown'
> {
  readonly ref?: Ref<HTMLSpanElement> | undefined;
  /** A plain React handler: Base UI's own label handler is replaced, so there's none to skip. */
  readonly onPointerDown?: PointerEventHandler<HTMLSpanElement> | undefined;
}
/** What Root's `onValueChange` receives: an array with `multiple`, otherwise a value or `null`. */
export type SearchableDropdownRootChangedValue<
  Value,
  Multiple extends boolean | undefined,
> = DropdownRootChangedValue<Value, Multiple>;
export type SearchableDropdownControlProps = DropdownControlProps;
export type SearchableDropdownClearProps = DropdownClearProps;
export type SearchableDropdownValueCountProps = DropdownValueCountProps;
export type SearchableDropdownStatusProps = BaseCombobox.Status.Props;
export interface SearchableDropdownTriggerProps extends BaseCombobox.Trigger.Props {
  /** `compact` removes block padding but keeps the touch target height. */
  readonly density?: DropdownTriggerDensity;
}
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
export interface SearchableDropdownSeparatorProps extends Omit<
  BaseCombobox.Separator.Props,
  'orientation'
> {
  /** Only horizontal is supported. */
  readonly orientation?: 'horizontal';
}
export type SearchableDropdownEmptyProps = BaseCombobox.Empty.Props;

const MultipleContext = /* @__PURE__ */ createContext(false);

export function SearchableDropdownRoot<
  Value,
  Multiple extends boolean | undefined = false,
  Item = Value,
>({
  value: valueProp,
  defaultValue,
  onValueChange,
  ...props
}: SearchableDropdownRootProps<Value, Multiple, Item>): React.JSX.Element {
  const multiple = props.multiple ?? false;
  const {value, changeValue, context} = useClearableValue({
    value: valueProp,
    defaultValue,
    // SAFETY: `multiple` is the runtime value of the `Multiple` type parameter, so the empty
    // value has the shape `onValueChange` expects.
    emptyValue: (multiple ? [] : null) as SearchableDropdownRootChangedValue<Value, Multiple>,
    disabled: Boolean(props.disabled || props.readOnly),
    onValueChange,
  });

  return (
    <ClearContext value={context}>
      <MultipleContext.Provider value={multiple}>
        <BaseCombobox.Root<Value, Multiple, Item>
          {...props}
          value={value}
          onValueChange={changeValue}
          grid={false}
        />
      </MultipleContext.Provider>
    </ClearContext>
  );
}

export function SearchableDropdownLabel({ref, className, ...props}: SearchableDropdownLabelProps) {
  return (
    <BaseCombobox.Label
      {...props}
      ref={ref}
      className={mergeClassName<BaseCombobox.Label.State>(styles.label, className)}
    />
  );
}

/**
 * A muted label inside the trigger, before the value, such as “Groups”, followed by a colon.
 * It's Base UI's `Combobox.Label` rendered as a `<span>` and takes its props, except `render`;
 * use it instead of `Label`. The colon isn't part of the trigger's name.
 */
export function SearchableDropdownPrefix({
  ref,
  className,
  onPointerDown,
  ...props
}: SearchableDropdownPrefixProps) {
  return (
    // As Dropdown.Prefix: the wrapper draws the colon outside the label that names the trigger,
    // and keeps both out of the trigger's value.
    <span className={styles.prefix} aria-hidden="true">
      <BaseCombobox.Label
        {...props}
        // Base UI's label cancels `pointerdown`, which keeps the trigger from opening, so its
        // handler is replaced; `preventBaseUIHandler()` would also skip the trigger's.
        render={(labelProps) => <span {...labelProps} ref={ref} onPointerDown={onPointerDown} />}
        className={className}
      />
    </span>
  );
}

export function SearchableDropdownTrigger({
  ref,
  density = 'default',
  className,
  ...props
}: SearchableDropdownTriggerProps) {
  const {triggerRef} = useClearContext('Trigger');
  const mergedRef = useMergedRef(triggerRef, ref);
  return (
    <BaseCombobox.Trigger
      {...props}
      ref={mergedRef}
      data-density={density}
      className={mergeClassName<BaseCombobox.Trigger.State>(styles.trigger, className)}
    />
  );
}

export function SearchableDropdownIcon({
  ref,
  className,
  children,
  ...props
}: SearchableDropdownIconProps) {
  return (
    <BaseCombobox.Icon
      {...props}
      ref={ref}
      className={mergeClassName<BaseCombobox.Icon.State>(styles.icon, className)}
    >
      {children ?? <KeyboardArrowDownIcon />}
    </BaseCombobox.Icon>
  );
}

export function SearchableDropdownPopup({ref, className, ...props}: SearchableDropdownPopupProps) {
  return (
    <BaseCombobox.Popup
      {...props}
      ref={ref}
      className={mergeClassName<BaseCombobox.Popup.State>(styles.popup, className)}
    />
  );
}

export function SearchableDropdownInputGroup({
  ref,
  className,
  children,
  ...props
}: SearchableDropdownInputGroupProps) {
  return (
    <BaseCombobox.InputGroup
      {...props}
      ref={ref}
      className={mergeClassName<BaseCombobox.InputGroup.State>(styles.inputGroup, className)}
    >
      <span className={styles.searchIcon} aria-hidden="true">
        <SearchIcon />
      </span>
      {children}
    </BaseCombobox.InputGroup>
  );
}

export function SearchableDropdownInput({
  ref,
  className,
  type = 'text',
  ...props
}: SearchableDropdownInputProps) {
  if (!inputTypes.includes(type)) {
    throw new TypeError(
      `SearchableDropdown.Input does not support type="${type}". Use one of: ${inputTypes.join(', ')}.`,
    );
  }

  return (
    <BaseCombobox.Input
      {...props}
      ref={ref}
      type={type}
      className={mergeClassName<BaseCombobox.Input.State>(styles.input, className)}
    />
  );
}

export function SearchableDropdownList({ref, className, ...props}: SearchableDropdownListProps) {
  return (
    <BaseCombobox.List
      {...props}
      ref={ref}
      className={mergeClassName<BaseCombobox.List.State>(styles.list, className)}
    />
  );
}

export function SearchableDropdownItem({ref, className, ...props}: SearchableDropdownItemProps) {
  return (
    <BaseCombobox.Item
      {...props}
      ref={ref}
      className={mergeClassName<BaseCombobox.Item.State>(styles.item, className)}
    />
  );
}

export function SearchableDropdownItemIndicator({
  ref,
  className,
  children = null,
  ...props
}: SearchableDropdownItemIndicatorProps) {
  const multiple = useContext(MultipleContext);

  return (
    <span className={classes(styles.indicatorFrame, multiple && styles.indicatorFrameMultiple)}>
      <BaseCombobox.ItemIndicator
        {...props}
        ref={ref}
        className={mergeClassName<BaseCombobox.ItemIndicator.State>(
          styles.itemIndicator,
          className,
        )}
      >
        {children}
      </BaseCombobox.ItemIndicator>
    </span>
  );
}

export function SearchableDropdownGroupLabel({
  ref,
  className,
  ...props
}: SearchableDropdownGroupLabelProps) {
  return (
    <BaseCombobox.GroupLabel
      {...props}
      ref={ref}
      className={mergeClassName<BaseCombobox.GroupLabel.State>(styles.groupLabel, className)}
    />
  );
}

export function SearchableDropdownSeparator({
  ref,
  className,
  ...props
}: SearchableDropdownSeparatorProps) {
  return (
    <BaseCombobox.Separator
      {...props}
      ref={ref}
      orientation="horizontal"
      className={mergeClassName<BaseCombobox.Separator.State>(styles.separator, className)}
    />
  );
}

export function SearchableDropdownEmpty({ref, className, ...props}: SearchableDropdownEmptyProps) {
  return (
    <BaseCombobox.Empty
      {...props}
      ref={ref}
      className={mergeClassName<BaseCombobox.Empty.State>(styles.empty, className)}
    />
  );
}

export function SearchableDropdownStatus({
  ref,
  className,
  ...props
}: SearchableDropdownStatusProps) {
  return (
    <BaseCombobox.Status
      {...props}
      ref={ref}
      className={mergeClassName<BaseCombobox.Status.State>(styles.status, className)}
    />
  );
}
