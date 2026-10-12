import {Toggle} from '@base-ui/react/toggle';
import {ToggleGroup as BaseToggleGroup} from '@base-ui/react/toggle-group';

import {mergeClassName} from '../utils/class-names.ts';

import styles from './segmented-control.module.css';

export type SegmentedControlRootProps<Value extends string = string> =
  BaseToggleGroup.Props<Value> & {
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

export function SegmentedControl<Value extends string = string>({
  ref,
  className,
  ...props
}: SegmentedControlRootProps<Value>): React.JSX.Element {
  return (
    <BaseToggleGroup<Value>
      {...props}
      orientation="horizontal"
      multiple={false}
      ref={ref}
      className={mergeClassName<BaseToggleGroup.State>(styles.root, className)}
    />
  );
}

export function SegmentedControlItem({
  ref,
  className,
  type = 'button',
  ...props
}: SegmentedControlItemProps) {
  return (
    <Toggle
      {...props}
      ref={ref}
      type={type}
      className={mergeClassName<Toggle.State>(styles.item, className)}
    />
  );
}
