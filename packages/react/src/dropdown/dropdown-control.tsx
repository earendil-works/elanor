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

import styles from './dropdown-control.module.css';

/** What Root's `onValueChange` receives: an array with `multiple`, otherwise a value or `null`. */
export type ChangedValue<Value, Multiple extends boolean | undefined> =
  | (Multiple extends true ? Value[] : Value)
  | (Multiple extends true ? never : null);

/** The details Root's `onValueChange` receives when Clear empties the value. */
export type DropdownClearPressDetails = BaseUIChangeEventDetails<'clear-press'>;

interface ClearContextValue {
  /** Nothing is selected: `null`, or an empty array with `multiple`. */
  readonly empty: boolean;
  /** The Root is disabled or read-only. */
  readonly disabled: boolean;
  /** Empties the value through the Root's `onValueChange`, then focuses the trigger. */
  readonly clear: (event: MouseEvent<HTMLElement>) => void;
  readonly triggerRef: RefObject<HTMLButtonElement | null>;
}

export const ClearContext = /* @__PURE__ */ createContext<ClearContextValue | null>(null);

export function useClearContext(part: string): ClearContextValue {
  const value = use(ClearContext);
  if (!value) throw new Error(`${part} must be inside Dropdown.Root or SearchableDropdown.Root.`);
  return value;
}

interface ClearableValueOptions<Value, NextValue extends Value, Details> {
  readonly value: Value | undefined;
  readonly defaultValue: Value | undefined;
  /** `null`, or an empty array with `multiple`. */
  readonly emptyValue: NextValue;
  readonly disabled: boolean;
  readonly onValueChange:
    | ((value: NextValue, details: Details | DropdownClearPressDetails) => void)
    | undefined;
}

/**
 * Owns the Root's value so Clear can empty it. Base UI has no way to set an uncontrolled value
 * from outside, so an uncontrolled Root keeps its value here and passes it to Base UI controlled.
 */
export function useClearableValue<
  Value,
  NextValue extends Value,
  Details extends {readonly isCanceled: boolean},
>({
  value: valueProp,
  defaultValue,
  emptyValue,
  disabled,
  onValueChange,
}: ClearableValueOptions<Value, NextValue, Details>) {
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
    changeValue(emptyValue, details);
    if (!details.isCanceled) triggerRef.current?.focus();
  }

  const empty = value === null || (Array.isArray(value) && value.length === 0);
  const context: ClearContextValue = {empty, disabled, clear, triggerRef};
  return {value, changeValue, context};
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
  const {empty} = useClearContext('Control');
  return (
    <div
      {...props}
      ref={ref}
      data-has-value={empty ? undefined : ''}
      className={classes(styles.control, className)}
    />
  );
}

export interface DropdownClearProps extends Omit<BaseButton.Props, 'aria-label'> {
  /** Names the button, such as “Clear Status filter”. */
  readonly 'aria-label': string;
  /**
   * Whether Clear renders. Set it for a filter with a default, to show Clear while the value
   * differs from the default.
   * @default true while a value is selected
   */
  readonly visible?: boolean | undefined;
}

/**
 * Empties the value and focuses the trigger. Renders only while a value is selected. Put it after
 * the trigger, inside Control.
 */
export function DropdownClear({
  ref,
  visible,
  className,
  children,
  disabled = false,
  type = 'button',
  onClick,
  ...props
}: DropdownClearProps) {
  const context = useClearContext('Clear');
  const shown = visible ?? !context.empty;
  if (!shown) return null;

  return (
    <BaseButton
      {...props}
      ref={ref}
      type={type}
      disabled={disabled || context.disabled}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.clear(event);
      }}
      className={mergeClassName<BaseButton.State>(styles.clear, className)}
    >
      {children ?? <CloseIcon />}
    </BaseButton>
  );
}
