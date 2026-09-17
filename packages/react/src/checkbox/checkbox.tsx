import {Checkbox as BaseCheckbox} from '@base-ui/react/checkbox';
import {forwardRef} from 'react';
import styles from './checkbox.module.css';
import {mergeClassName} from '../utils/class-names.ts';

export type {
  CheckboxRootState,
  CheckboxRootChangeEventReason,
  CheckboxRootChangeEventDetails,
  CheckboxIndicatorState,
} from '@base-ui/react/checkbox';

export type CheckboxRootProps = BaseCheckbox.Root.Props;
export type CheckboxIndicatorProps = BaseCheckbox.Indicator.Props;

export const CheckboxRoot = forwardRef<HTMLElement, CheckboxRootProps>(
  function CheckboxRoot({className, ...props}, ref) {
    return (
      <BaseCheckbox.Root
        {...props}
        ref={ref}
        className={mergeClassName<BaseCheckbox.Root.State>(styles.root, className)}
      />
    );
  },
);

export const CheckboxIndicator = forwardRef<HTMLSpanElement, CheckboxIndicatorProps>(
  function CheckboxIndicator({className, ...props}, ref) {
    return (
      <BaseCheckbox.Indicator
        {...props}
        ref={ref}
        className={mergeClassName<BaseCheckbox.Indicator.State>(styles.indicator, className)}
      />
    );
  },
);

export const Checkbox = {
  Root: CheckboxRoot,
  Indicator: CheckboxIndicator,
} as const;
