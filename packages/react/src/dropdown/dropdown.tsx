import {Select as BaseSelect} from '@base-ui/react/select';
import {KeyboardArrowDownIcon} from '@earendil-works/elanor-icons-react';
import {
  createContext,
  useContext,
  type ComponentPropsWithRef,
  type HTMLAttributes,
  type Ref,
} from 'react';

import {classes, mergeClassName} from '../utils/class-names.ts';
import {useMergedRef} from '../utils/refs.ts';
import {
  ClearContext,
  useClearableValue,
  useClearContext,
  type DropdownClearPressDetails,
} from './dropdown-control.tsx';

import styles from './dropdown.module.css';

export type {
  SelectRootActions as DropdownRootActions,
  SelectLabelState as DropdownLabelState,
  SelectTriggerState as DropdownTriggerState,
  SelectValueState as DropdownValueState,
  SelectValueProps as DropdownValueProps,
  SelectIconState as DropdownIconState,
  SelectPortalProps as DropdownPortalProps,
  SelectPositionerState as DropdownPositionerState,
  SelectPopupState as DropdownPopupState,
  SelectItemState as DropdownItemState,
  SelectItemIndicatorState as DropdownItemIndicatorState,
  SelectItemTextProps as DropdownItemTextProps,
  SelectGroupProps as DropdownGroupProps,
  SelectSeparatorState as DropdownSeparatorState,
} from '@base-ui/react/select';

export type DropdownRootChangeEventReason = BaseSelect.Root.ChangeEventReason | 'clear-press';
export type DropdownRootChangeEventDetails =
  | BaseSelect.Root.ChangeEventDetails
  | DropdownClearPressDetails;

/** What `onValueChange` receives: an array with `multiple`, otherwise one value or `null`. */
type DropdownRootNextValue<Value, Multiple extends boolean | undefined> =
  | (Multiple extends true ? Value[] : Value)
  | (Multiple extends true ? never : null);

export interface DropdownRootProps<
  Value,
  Multiple extends boolean | undefined = false,
> extends Omit<BaseSelect.Root.Props<Value, Multiple>, 'onValueChange'> {
  /** Called when the value changes, including with `clear-press` when Clear empties it. */
  readonly onValueChange?:
    | ((
        value: DropdownRootNextValue<Value, Multiple>,
        eventDetails: DropdownRootChangeEventDetails,
      ) => void)
    | undefined;
}
export type DropdownLabelProps = BaseSelect.Label.Props;
export interface DropdownPrefixProps extends Omit<BaseSelect.Label.Props, 'ref' | 'render'> {
  readonly ref?: Ref<HTMLSpanElement> | undefined;
}
export type DropdownTriggerDensity = 'compact' | 'default';

export interface DropdownTriggerProps extends BaseSelect.Trigger.Props {
  /** `compact` removes block padding but keeps the touch target height. */
  readonly density?: DropdownTriggerDensity;
}
export interface DropdownValueCountProps extends HTMLAttributes<HTMLSpanElement> {
  readonly ref?: Ref<HTMLSpanElement> | undefined;
}
export type DropdownIconProps = BaseSelect.Icon.Props;
export type DropdownPositionerProps = BaseSelect.Positioner.Props;
export type DropdownPopupProps = BaseSelect.Popup.Props;
export type DropdownListProps = BaseSelect.List.Props;
export type DropdownItemProps = ComponentPropsWithRef<typeof BaseSelect.Item>;
export type DropdownItemIndicatorProps = BaseSelect.ItemIndicator.Props;
export type DropdownGroupLabelProps = BaseSelect.GroupLabel.Props;
export interface DropdownSeparatorProps extends Omit<BaseSelect.Separator.Props, 'orientation'> {
  /** Only horizontal is supported. */
  readonly orientation?: 'horizontal';
}

const MultipleContext = /* @__PURE__ */ createContext(false);

export function DropdownRoot<Value, Multiple extends boolean | undefined = false>({
  value: valueProp,
  defaultValue,
  onValueChange,
  ...props
}: DropdownRootProps<Value, Multiple>): React.JSX.Element {
  const multiple = props.multiple ?? false;
  const {value, changeValue, context} = useClearableValue({
    value: valueProp,
    defaultValue,
    emptyValue: emptySelection<Value, Multiple>(multiple),
    disabled: Boolean(props.disabled || props.readOnly),
    onValueChange,
  });

  return (
    <ClearContext value={context}>
      <MultipleContext.Provider value={multiple}>
        <BaseSelect.Root<Value, Multiple> {...props} value={value} onValueChange={changeValue} />
      </MultipleContext.Provider>
    </ClearContext>
  );
}

function emptySelection<Value, Multiple extends boolean | undefined>(
  multiple: boolean,
): DropdownRootNextValue<Value, Multiple> {
  // `multiple` decides the value's shape at runtime; the type parameter mirrors it.
  return (multiple ? [] : null) as DropdownRootNextValue<Value, Multiple>;
}

export function DropdownLabel({ref, className, ...props}: DropdownLabelProps) {
  return (
    <BaseSelect.Label
      {...props}
      ref={ref}
      className={mergeClassName<BaseSelect.Label.State>(styles.label, className)}
    />
  );
}

/**
 * A muted label inside the trigger, before the value, such as "Date range:". It's Base UI's
 * `Select.Label` rendered as a `<span>`, so use it instead of `Label`.
 */
export function DropdownPrefix({ref, className, onPointerDown, ...props}: DropdownPrefixProps) {
  return (
    <BaseSelect.Label
      {...props}
      // Phrasing content inside the trigger's button. The trigger's `aria-labelledby` reads it
      // as the name, so it's hidden from the trigger's content, which screen readers read as
      // the value. Base UI's label cancels `pointerdown`, which keeps the trigger from opening,
      // so its handler is replaced; `preventBaseUIHandler()` would also skip the trigger's.
      render={(labelProps) => (
        <span {...labelProps} ref={ref} aria-hidden="true" onPointerDown={onPointerDown} />
      )}
      className={mergeClassName<BaseSelect.Label.State>(styles.prefix, className)}
    />
  );
}

export function DropdownTrigger({
  ref,
  density = 'default',
  className,
  ...props
}: DropdownTriggerProps) {
  const {triggerRef} = useClearContext('Trigger');
  const mergedRef = useMergedRef(triggerRef, ref);
  return (
    <BaseSelect.Trigger
      {...props}
      ref={mergedRef}
      data-density={density}
      className={mergeClassName<BaseSelect.Trigger.State>(styles.trigger, className)}
    />
  );
}

/**
 * A muted count after the value, such as “+2” for the other selected values. It stays whole
 * while the value truncates.
 */
export function DropdownValueCount({ref, className, ...props}: DropdownValueCountProps) {
  return <span {...props} ref={ref} className={classes(styles.valueCount, className)} />;
}

export function DropdownIcon({ref, className, children, ...props}: DropdownIconProps) {
  return (
    <BaseSelect.Icon
      {...props}
      ref={ref}
      className={mergeClassName<BaseSelect.Icon.State>(styles.icon, className)}
    >
      {children ?? <KeyboardArrowDownIcon />}
    </BaseSelect.Icon>
  );
}

export function DropdownPositioner({
  ref,
  alignItemWithTrigger = false,
  align = 'start',
  ...props
}: DropdownPositionerProps) {
  return (
    <BaseSelect.Positioner
      {...props}
      ref={ref}
      align={align}
      alignItemWithTrigger={alignItemWithTrigger}
    />
  );
}

export function DropdownPopup({ref, className, ...props}: DropdownPopupProps) {
  return (
    <BaseSelect.Popup
      {...props}
      ref={ref}
      className={mergeClassName<BaseSelect.Popup.State>(styles.popup, className)}
    />
  );
}

export function DropdownList({ref, className, ...props}: DropdownListProps) {
  return (
    <BaseSelect.List
      {...props}
      ref={ref}
      className={mergeClassName<BaseSelect.List.State>(styles.list, className)}
    />
  );
}

export function DropdownItem({ref, className, ...props}: DropdownItemProps) {
  return (
    <BaseSelect.Item
      {...props}
      ref={ref}
      className={mergeClassName<BaseSelect.Item.State>(styles.item, className)}
    />
  );
}

export function DropdownItemIndicator({
  ref,
  className,
  children = null,
  ...props
}: DropdownItemIndicatorProps) {
  const multiple = useContext(MultipleContext);

  return (
    <span className={classes(styles.indicatorFrame, multiple && styles.indicatorFrameMultiple)}>
      <BaseSelect.ItemIndicator
        {...props}
        ref={ref}
        className={mergeClassName<BaseSelect.ItemIndicator.State>(styles.itemIndicator, className)}
      >
        {children}
      </BaseSelect.ItemIndicator>
    </span>
  );
}

export function DropdownGroupLabel({ref, className, ...props}: DropdownGroupLabelProps) {
  return (
    <BaseSelect.GroupLabel
      {...props}
      ref={ref}
      className={mergeClassName<BaseSelect.GroupLabel.State>(styles.groupLabel, className)}
    />
  );
}

export function DropdownSeparator({ref, className, ...props}: DropdownSeparatorProps) {
  return (
    <BaseSelect.Separator
      {...props}
      ref={ref}
      orientation="horizontal"
      className={mergeClassName<BaseSelect.Separator.State>(styles.separator, className)}
    />
  );
}
