import {Radio as BaseRadio} from '@base-ui/react/radio';
import {RadioGroup as BaseRadioGroup} from '@base-ui/react/radio-group';
import {forwardRef, type Ref} from 'react';
import styles from './radio.module.css';
import {useBrushVariant} from '../brush-border/use-brush-variant.ts';
import {mergeClassName} from '../utils/class-names.ts';

export type {
  RadioRootState,
  RadioRootProps,
  RadioIndicatorProps,
  RadioIndicatorState,
} from '@base-ui/react/radio';

export type {
  RadioGroupState,
  RadioGroupProps,
  RadioGroupChangeEventReason,
  RadioGroupChangeEventDetails,
} from '@base-ui/react/radio-group';

export const RadioRoot = forwardRef(function RadioRoot<Value>(
  {className, ...props}: BaseRadio.Root.Props<Value>,
  ref: Ref<HTMLSpanElement>,
): React.JSX.Element {
  return (
    <BaseRadio.Root<Value>
      data-brush-variant={useBrushVariant()}
      {...props}
      ref={ref}
      className={mergeClassName<BaseRadio.Root.State>(styles.radio, className)}
    />
  );
}) as typeof BaseRadio.Root;

export const RadioIndicator = forwardRef<HTMLSpanElement, BaseRadio.Indicator.Props>(
  function RadioIndicator({className, ...props}, ref) {
    return (
      <BaseRadio.Indicator
        {...props}
        ref={ref}
        className={mergeClassName<BaseRadio.Indicator.State>(styles.indicator, className)}
      />
    );
  },
);

export const Radio = {
  Group: BaseRadioGroup,
  Root: RadioRoot,
  Indicator: RadioIndicator,
} as const;
