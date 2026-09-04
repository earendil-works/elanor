import {Checkbox as BaseCheckbox} from '@base-ui/react/checkbox';
import {forwardRef} from 'react';
import styles from './checkbox.module.css';
import {mergeClassName} from './shared.ts';

export type {
  CheckboxRootState,
  CheckboxRootProps,
  CheckboxRootChangeEventReason,
  CheckboxRootChangeEventDetails,
  CheckboxIndicatorState,
  CheckboxIndicatorProps,
} from '@base-ui/react/checkbox';

export const CheckboxRoot = forwardRef<HTMLElement, BaseCheckbox.Root.Props>(
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

export const CheckboxIndicator = forwardRef<HTMLSpanElement, BaseCheckbox.Indicator.Props>(
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
