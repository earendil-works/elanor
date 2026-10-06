import {Toggle} from '@base-ui/react/toggle';
import {ToggleGroup as BaseToggleGroup} from '@base-ui/react/toggle-group';
import {forwardRef, type Ref, type RefAttributes} from 'react';
import styles from './segmented-control.module.css';
import outline from '../utils/outline.module.css';
import {classes, mergeClassName} from '../utils/class-names.ts';

export type SegmentedControlProps<Value extends string = string> = BaseToggleGroup.Props<Value> & {
  readonly orientation?: 'horizontal';
  readonly multiple?: false;
};
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
      orientation="horizontal"
      multiple={false}
      ref={ref}
      className={mergeClassName<BaseToggleGroup.State>(styles.root, className)}
    />
  );
}) as <Value extends string = string>(
  props: SegmentedControlProps<Value> & RefAttributes<HTMLDivElement>,
) => React.JSX.Element;

export const SegmentedControlItem = forwardRef<HTMLButtonElement, SegmentedControlItemProps>(
  function SegmentedControlItem({className, type = 'button', ...props}, ref) {
    return (
      <Toggle
        data-outline="box-small"
        {...props}
        ref={ref}
        type={type}
        className={mergeClassName<Toggle.State>(classes(styles.item, outline.outline), className)}
      />
    );
  },
);
