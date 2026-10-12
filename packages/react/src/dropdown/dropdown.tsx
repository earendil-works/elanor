import {Select as BaseSelect} from '@base-ui/react/select';
import {KeyboardArrowDownIcon} from '@earendil-works/elanor-icons-react';
import {createContext, forwardRef, useContext} from 'react';
import styles from './dropdown.module.css';
import mark from '../utils/mark.module.css';
import {useIndicatorClassName, useSurfaceClassName} from '../appearance/appearance.tsx';
import {classes, mergeClassName} from '../utils/class-names.ts';

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

export type DropdownRootProps<Value, Multiple extends boolean | undefined = false> = BaseSelect.Root.Props<Value, Multiple>;
export type DropdownLabelProps = BaseSelect.Label.Props;
export type DropdownTriggerProps = BaseSelect.Trigger.Props;
export type DropdownIconProps = BaseSelect.Icon.Props;
export type DropdownPositionerProps = BaseSelect.Positioner.Props;
export type DropdownPopupProps = BaseSelect.Popup.Props;
export type DropdownListProps = BaseSelect.List.Props;
export type DropdownItemProps = BaseSelect.Item.Props;
export type DropdownItemIndicatorProps = BaseSelect.ItemIndicator.Props;
export type DropdownGroupLabelProps = BaseSelect.GroupLabel.Props;
export interface DropdownSeparatorProps extends Omit<BaseSelect.Separator.Props, 'orientation'> {
  readonly orientation?: 'horizontal';
}

const MultipleContext = createContext(false);

function DropdownRoot<Value, Multiple extends boolean | undefined = false>(
  props: DropdownRootProps<Value, Multiple>,
): React.JSX.Element {
  return (
    <MultipleContext.Provider value={props.multiple ?? false}>
      <BaseSelect.Root<Value, Multiple> {...props} />
    </MultipleContext.Provider>
  );
}

export const DropdownLabel = forwardRef<HTMLDivElement, DropdownLabelProps>(
  function DropdownLabel({className, ...props}, ref) {
    return (
      <BaseSelect.Label
        {...props}
        ref={ref}
        className={mergeClassName<BaseSelect.Label.State>(styles.label, className)}
      />
    );
  },
);

export const DropdownTrigger = forwardRef<HTMLButtonElement, DropdownTriggerProps>(
  function DropdownTrigger({className, ...props}, ref) {
    const surfaceClassName = useSurfaceClassName();
    return (
      <BaseSelect.Trigger
        data-outline="box-small"
        data-outline-focus="self"
        {...props}
        ref={ref}
        className={mergeClassName<BaseSelect.Trigger.State>(classes(styles.trigger, surfaceClassName), className)}
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
        {children ?? <KeyboardArrowDownIcon />}
      </BaseSelect.Icon>
    );
  },
);

export const DropdownPositioner = forwardRef<HTMLDivElement, DropdownPositionerProps>(
  function DropdownPositioner({alignItemWithTrigger = false, align = 'start', ...props}, ref) {
    return (
      <BaseSelect.Positioner
        {...props}
        ref={ref}
        align={align}
        alignItemWithTrigger={alignItemWithTrigger}
      />
    );
  },
);

export const DropdownPopup = forwardRef<HTMLDivElement, DropdownPopupProps>(
  function DropdownPopup({className, ...props}, ref) {
    const surfaceClassName = useSurfaceClassName();
    return (
      <BaseSelect.Popup
        data-outline="box-small"
        data-outline-focus="none"
        {...props}
        ref={ref}
        className={mergeClassName<BaseSelect.Popup.State>(classes(styles.popup, surfaceClassName), className)}
      />
    );
  },
);

export const DropdownList = forwardRef<HTMLDivElement, DropdownListProps>(
  function DropdownList({className, ...props}, ref) {
    return (
      <BaseSelect.List
        data-surface-content=""
        {...props}
        ref={ref}
        className={mergeClassName<BaseSelect.List.State>(styles.list, className)}
      />
    );
  },
);

export const DropdownItem = forwardRef<HTMLElement, DropdownItemProps>(
  function DropdownItem({className, ...props}, ref) {
    const surfaceClassName = useSurfaceClassName();
    return (
      <BaseSelect.Item
        data-outline="box-small"
        data-outline-band="none"
        data-outline-focus="none"
        {...props}
        ref={ref}
        className={mergeClassName<BaseSelect.Item.State>(classes(styles.item, surfaceClassName), className)}
      />
    );
  },
);

export const DropdownItemIndicator = forwardRef<HTMLSpanElement, DropdownItemIndicatorProps>(
  function DropdownItemIndicator({className, children = null, ...props}, ref) {
    const surfaceClassName = useSurfaceClassName();
    const indicatorClassName = useIndicatorClassName();
    const multiple = useContext(MultipleContext);
    // A render override owns indicator content, even when it only replaces the element.
    // Supply the default glyph only when neither children nor render provides custom content.
    const isDefaultMark = children === null && props.render === undefined;

    return (
      <span
        className={classes(styles.indicatorFrame, multiple && styles.indicatorFrameMultiple, surfaceClassName)}
        data-outline={multiple ? 'box-small' : 'circle-x-small'}
        data-outline-focus="none"
      >
        <BaseSelect.ItemIndicator
          {...props}
          ref={ref}
          className={mergeClassName<BaseSelect.ItemIndicator.State>(styles.itemIndicator, className)}
        >
          {isDefaultMark ? (
            <span
              data-indicator={multiple ? 'check' : 'dot'}
              className={classes(
                multiple ? styles.itemCheck : styles.itemDot,
                multiple ? mark.check : mark.dot,
                indicatorClassName,
              )}
            />
          ) : children}
        </BaseSelect.ItemIndicator>
      </span>
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
    const surfaceClassName = useSurfaceClassName();
    return (
      <BaseSelect.Separator
        data-outline="line"
        data-outline-focus="none"
        {...props}
        ref={ref}
        orientation="horizontal"
        className={mergeClassName<BaseSelect.Separator.State>(classes(styles.separator, surfaceClassName), className)}
      />
    );
  },
);

export const Dropdown = {
  Root: DropdownRoot,
  Label: DropdownLabel,
  Trigger: DropdownTrigger,
  Value: BaseSelect.Value,
  Icon: DropdownIcon,
  Portal: BaseSelect.Portal,
  Positioner: DropdownPositioner,
  Popup: DropdownPopup,
  List: DropdownList,
  Item: DropdownItem,
  ItemIndicator: DropdownItemIndicator,
  ItemText: BaseSelect.ItemText,
  Group: BaseSelect.Group,
  GroupLabel: DropdownGroupLabel,
  Separator: DropdownSeparator,
} as const;
