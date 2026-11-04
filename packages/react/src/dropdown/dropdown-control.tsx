import {Button as BaseButton} from '@base-ui/react/button';
import type {BaseUIChangeEventDetails} from '@base-ui/react/types';
import {CloseIcon} from '@earendil-works/elanor-icons-react';
import {
  createContext,
  use,
  useRef,
  useState,
  type HTMLAttributes,
  type MouseEvent,
  type Ref,
  type RefObject,
} from 'react';

import {classes, mergeClassName} from '../utils/class-names.ts';
import {DisabledContext} from '../utils/disabled-context.ts';

import styles from './dropdown-control.module.css';

/** What Root's `onValueChange` receives: an array with `multiple`, otherwise a value or `null`. */
export type DropdownRootChangedValue<Value, Multiple extends boolean | undefined> =
  | (Multiple extends true ? Value[] : Value)
  | (Multiple extends true ? never : null);

/** The details Root's `onValueChange` receives when Clear clears the value. */
export type DropdownClearPressDetails = BaseUIChangeEventDetails<'clear-press'>;

interface ClearContextValue {
  /** The value is the one Clear sets, so there's nothing to clear. */
  readonly cleared: boolean;
  /** How many values are selected: 0 or 1, or any number with `multiple`. */
  readonly selectedCount: number;
  /** The Root is disabled or read-only. */
  readonly disabled: boolean;
  /** Sets the clear value through the Root's `onValueChange`, then focuses the trigger. */
  readonly clear: (event: MouseEvent<HTMLElement>) => void;
  readonly triggerRef: RefObject<HTMLButtonElement | null>;
}

export const ClearContext = /* @__PURE__ */ createContext<ClearContextValue | null>(null);

export function useClearContext(part: string): ClearContextValue {
  const value = use(ClearContext);
  if (!value) throw new Error(`${part} must be inside Dropdown.Root or SearchableDropdown.Root.`);
  return value;
}

/** One value, several with `multiple`, or none. */
type Selection<Item> = Item | readonly Item[] | null;

interface ClearableValueOptions<
  Item,
  Value extends Selection<Item>,
  NextValue extends Value,
  Details,
> {
  readonly value: Value | undefined;
  readonly defaultValue: Value | undefined;
  /** `null`, or an empty array with `multiple`. */
  readonly emptyValue: NextValue;
  /** What Clear sets instead of the empty value, such as a filter's default. */
  readonly clearValue: NextValue | undefined;
  readonly isItemEqualToValue: ((itemValue: Item, value: Item) => boolean) | undefined;
  readonly disabled: boolean;
  readonly onValueChange:
    | ((value: NextValue, details: Details | DropdownClearPressDetails) => void)
    | undefined;
}

/**
 * Owns the Root's value so Clear can clear it. Base UI has no way to set an uncontrolled value
 * from outside, so an uncontrolled Root keeps its value here and passes it to Base UI controlled.
 */
export function useClearableValue<
  Item,
  Value extends Selection<Item>,
  NextValue extends Value,
  Details extends {readonly isCanceled: boolean},
>({
  value: valueProp,
  defaultValue,
  emptyValue,
  clearValue = emptyValue,
  isItemEqualToValue = Object.is,
  disabled,
  onValueChange,
}: ClearableValueOptions<Item, Value, NextValue, Details>) {
  const [uncontrolledValue, setUncontrolledValue] = useState<Value>(defaultValue ?? emptyValue);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const controlled = valueProp !== undefined;
  const value = controlled ? valueProp : uncontrolledValue;

  function changeValue(next: NextValue, details: Details | DropdownClearPressDetails) {
    onValueChange?.(next, details);
    if (!controlled && !details.isCanceled) setUncontrolledValue(next);
  }

  function clear(event: MouseEvent<HTMLElement>) {
    const details = createClearPressDetails(event.nativeEvent, event.currentTarget);
    changeValue(clearValue, details);
    if (!details.isCanceled) triggerRef.current?.focus();
  }

  const cleared = isSameSelection(value, clearValue, isItemEqualToValue);
  const selectedCount = isList(value) ? value.length : Number(value !== null);
  const context: ClearContextValue = {cleared, selectedCount, disabled, clear, triggerRef};
  return {value, changeValue, context};
}

/** The same items, in any order, as Base UI compares a selection with its items. */
function isSameSelection<Item>(
  a: Selection<Item>,
  b: Selection<Item>,
  isItemEqualToValue: (itemValue: Item, value: Item) => boolean,
): boolean {
  if (isList(a) || isList(b)) {
    if (!isList(a) || !isList(b) || a.length !== b.length) return false;
    return b.every((item) => a.some((other) => isItemEqualToValue(other, item)));
  }
  if (a === null || b === null) return a === b;
  return isItemEqualToValue(a, b);
}

function isList<Item>(selection: Selection<Item>): selection is readonly Item[] {
  return Array.isArray(selection);
}

/**
 * Base UI creates its event details with a factory on an internal subpath,
 * `@base-ui/react/internals/createBaseUIEventDetails`, which isn't covered by semver. This builds
 * the same object against the public type, so a Base UI upgrade that changes its shape fails to
 * type-check here instead of breaking at runtime.
 */
function createClearPressDetails(event: globalThis.MouseEvent, trigger: Element) {
  let canceled = false;
  let propagationAllowed = false;
  const details: DropdownClearPressDetails = {
    reason: 'clear-press',
    event,
    trigger,
    cancel() {
      canceled = true;
    },
    allowPropagation() {
      propagationAllowed = true;
    },
    get isCanceled() {
      return canceled;
    },
    get isPropagationAllowed() {
      return propagationAllowed;
    },
  };
  return details;
}

export interface DropdownControlProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

/**
 * Joins the trigger and Clear in one fill. `data-has-value` is set while a value is selected.
 */
export function DropdownControl({ref, className, ...props}: DropdownControlProps) {
  const {selectedCount} = useClearContext('Control');
  return (
    <div
      {...props}
      ref={ref}
      data-has-value={selectedCount > 0 ? '' : undefined}
      className={classes(styles.control, className)}
    />
  );
}

export interface DropdownValueCountProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  readonly ref?: Ref<HTMLSpanElement> | undefined;
  /**
   * How many values to count, shown as “+2”. Nothing renders below 1.
   * @default the selected values after the first
   */
  readonly count?: number | undefined;
  /**
   * What screen readers read instead of “+2”, after the value, so “developers +2” reads as
   * “developers and 2 more”.
   */
  readonly label?: ((count: number) => string) | undefined;
}

/**
 * A muted count of the selected values after the first, such as “+2”, after the value. It stays
 * whole while the value truncates. Screen readers read its `label` instead, such as “and 2 more”.
 */
export function DropdownValueCount({
  ref,
  count: countProp,
  label = (count) => `and ${count} more`,
  className,
  ...props
}: DropdownValueCountProps) {
  const {selectedCount} = useClearContext('ValueCount');
  const count = countProp ?? selectedCount - 1;
  if (count < 1) return null;

  return (
    <span {...props} ref={ref} className={classes(styles.valueCount, className)}>
      <span className={styles.valueCountNumber} aria-hidden="true">
        +{count}
      </span>
      <span className={styles.visuallyHidden}>{label(count)}</span>
    </span>
  );
}

export interface DropdownClearProps extends Omit<BaseButton.Props, 'aria-label'> {
  /** Names the button, such as “Clear Status filter”. */
  readonly 'aria-label': string;
}

/**
 * Clears the value, to none or Root's `clearValue`, and focuses the trigger. Renders only while
 * there's something to clear. Put it after the trigger, inside Control.
 */
export function DropdownClear({
  ref,
  className,
  children,
  disabled = false,
  type = 'button',
  onClick,
  ...props
}: DropdownClearProps) {
  const context = useClearContext('Clear');
  const fieldDisabled = use(DisabledContext);
  if (context.cleared) return null;

  return (
    <BaseButton
      {...props}
      ref={ref}
      type={type}
      disabled={disabled || context.disabled || fieldDisabled}
      onClick={(event) => {
        onClick?.(event);
        context.clear(event);
      }}
      className={mergeClassName<BaseButton.State>(styles.clear, className)}
    >
      {children ?? <CloseIcon />}
    </BaseButton>
  );
}
