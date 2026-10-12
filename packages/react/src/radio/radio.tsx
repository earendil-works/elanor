import {Radio as BaseRadio, type RadioRootProps} from '@base-ui/react/radio';
import {RadioGroup as BaseRadioGroup} from '@base-ui/react/radio-group';

import {mergeClassName} from '../utils/class-names.ts';

import styles from './radio.module.css';

export type {RadioRootState, RadioRootProps, RadioIndicatorState} from '@base-ui/react/radio';

export type {
  RadioGroupState,
  RadioGroupProps,
  RadioGroupChangeEventReason,
  RadioGroupChangeEventDetails,
} from '@base-ui/react/radio-group';

export type RadioIndicatorProps = BaseRadio.Indicator.Props;

export function RadioRoot<Value>({
  ref,
  className,
  ...props
}: RadioRootProps<Value>): React.JSX.Element {
  return (
    <BaseRadio.Root<Value>
      {...props}
      ref={ref}
      className={mergeClassName<BaseRadio.Root.State>(styles.radio, className)}
    />
  );
}

export function RadioIndicator({ref, className, ...props}: RadioIndicatorProps) {
  return (
    <BaseRadio.Indicator
      {...props}
      ref={ref}
      className={mergeClassName<BaseRadio.Indicator.State>(styles.indicator, className)}
    />
  );
}

export const Radio = {
  Group: BaseRadioGroup,
  Root: RadioRoot,
  Indicator: RadioIndicator,
} as const;
