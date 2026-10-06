import {Radio as BaseRadio, type RadioRootProps} from '@base-ui/react/radio';
import {RadioGroup as BaseRadioGroup} from '@base-ui/react/radio-group';
import {forwardRef, type Ref} from 'react';
import styles from './radio.module.css';
import mark from '../utils/mark.module.css';
import outline from '../utils/outline.module.css';
import {classes, mergeClassName} from '../utils/class-names.ts';

export type {
  RadioRootState,
  RadioRootProps,
  RadioIndicatorState,
} from '@base-ui/react/radio';

export type {
  RadioGroupState,
  RadioGroupProps,
  RadioGroupChangeEventReason,
  RadioGroupChangeEventDetails,
} from '@base-ui/react/radio-group';

export type RadioIndicatorProps = BaseRadio.Indicator.Props;

export const RadioRoot = forwardRef(function RadioRoot<Value>(
  {className, children, ...props}: RadioRootProps<Value>,
  ref: Ref<HTMLSpanElement>,
): React.JSX.Element {
  return (
    <BaseRadio.Root<Value>
      {...props}
      ref={ref}
      className={mergeClassName<BaseRadio.Root.State>(styles.radio, className)}
    >
      {/* The visible circle is smaller than the target, and carries the outline. */}
      <span className={classes(styles.circle, outline.outline)} data-outline="circle-x-small" aria-hidden="true" />
      {children}
    </BaseRadio.Root>
  );
}) as typeof BaseRadio.Root;

export const RadioIndicator = forwardRef<HTMLSpanElement, RadioIndicatorProps>(
  function RadioIndicator({className, ...props}, ref) {
    return (
      <BaseRadio.Indicator
        {...props}
        ref={ref}
        className={mergeClassName<BaseRadio.Indicator.State>(classes(styles.indicator, mark.dot), className)}
      />
    );
  },
);

export const Radio = {
  Group: BaseRadioGroup,
  Root: RadioRoot,
  Indicator: RadioIndicator,
} as const;
