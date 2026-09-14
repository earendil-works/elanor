import {Toggle} from '@base-ui/react/toggle';
import {ToggleGroup as BaseToggleGroup} from '@base-ui/react/toggle-group';
import {forwardRef, type Ref} from 'react';
import styles from './segmented-control.module.css';
import {mergeClassName} from '../utils/class-names.ts';

export type SegmentedControlProps<Value extends string = string> = BaseToggleGroup.Props<Value>;
export type SegmentedControlState = BaseToggleGroup.State;
export type SegmentedControlChangeEventDetails = BaseToggleGroup.ChangeEventDetails;
export type SegmentedControlChangeEventReason = BaseToggleGroup.ChangeEventReason;
export type SegmentedControlItemProps = Toggle.Props;
export type SegmentedControlItemState = Toggle.State;
export type SegmentedControlItemChangeEventDetails = Toggle.ChangeEventDetails;
export type SegmentedControlItemChangeEventReason = Toggle.ChangeEventReason;

export const SegmentedControl = forwardRef(function SegmentedControl<Value extends string = string>(
  {className, ...props}: SegmentedControlProps<Value>,
  ref: Ref<HTMLDivElement>,
): React.JSX.Element {
  return (
    <BaseToggleGroup<Value>
      {...props}
      ref={ref}
      className={mergeClassName<BaseToggleGroup.State>(styles.root, className)}
    />
  );
}) as typeof BaseToggleGroup;

export const SegmentedControlItem = forwardRef<HTMLButtonElement, Toggle.Props>(
  function SegmentedControlItem({className, type = 'button', ...props}, ref) {
    return (
      <Toggle
        {...props}
        ref={ref}
        type={type}
        className={mergeClassName<Toggle.State>(styles.item, className)}
      />
    );
  },
);
