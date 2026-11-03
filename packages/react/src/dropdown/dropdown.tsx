import {Select as BaseSelect} from '@base-ui/react/select';
import {KeyboardArrowDownIcon} from '@earendil-works/elanor-icons-react';
import {createContext, useContext, type ComponentPropsWithRef, type Ref} from 'react';

import {classes, mergeClassName} from '../utils/class-names.ts';

import styles from './dropdown.module.css';

export type {
  SelectRootActions as DropdownRootActions,
  SelectRootChangeEventReason as DropdownRootChangeEventReason,
  SelectRootChangeEventDetails as DropdownRootChangeEventDetails,
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

export type DropdownRootProps<
  Value,
  Multiple extends boolean | undefined = false,
> = BaseSelect.Root.Props<Value, Multiple>;
export type DropdownLabelProps = BaseSelect.Label.Props;
export interface DropdownPrefixProps extends Omit<BaseSelect.Label.Props, 'ref' | 'render'> {
  readonly ref?: Ref<HTMLSpanElement> | undefined;
}
export type DropdownTriggerDensity = 'compact' | 'default';

export interface DropdownTriggerProps extends BaseSelect.Trigger.Props {
  /** `compact` removes block padding but keeps the touch target height. */
  readonly density?: DropdownTriggerDensity;
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

export function DropdownRoot<Value, Multiple extends boolean | undefined = false>(
  props: DropdownRootProps<Value, Multiple>,
): React.JSX.Element {
  return (
    <MultipleContext.Provider value={props.multiple ?? false}>
      <BaseSelect.Root<Value, Multiple> {...props} />
    </MultipleContext.Provider>
  );
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
      // the value.
      render={<span ref={ref} aria-hidden="true" />}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        // Base UI's label prevents pointerdown, which would keep the trigger from opening.
        event.preventBaseUIHandler();
      }}
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
  return (
    <BaseSelect.Trigger
      {...props}
      ref={ref}
      data-density={density}
      className={mergeClassName<BaseSelect.Trigger.State>(styles.trigger, className)}
    />
  );
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
