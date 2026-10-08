import {Checkbox as BaseCheckbox} from '@base-ui/react/checkbox';
import {CheckIcon} from '@earendil-works/elanor-icons-react';
import {forwardRef} from 'react';

import {mergeClassName} from '../utils/class-names.ts';

import styles from './checkbox.module.css';

export type {
  CheckboxRootState,
  CheckboxRootChangeEventReason,
  CheckboxRootChangeEventDetails,
  CheckboxIndicatorState,
} from '@base-ui/react/checkbox';

export type CheckboxRootProps = BaseCheckbox.Root.Props;
export type CheckboxIndicatorProps = BaseCheckbox.Indicator.Props;

export const CheckboxRoot = forwardRef<HTMLElement, CheckboxRootProps>(function CheckboxRoot(
  {className, ...props},
  ref,
) {
  return (
    <BaseCheckbox.Root
      {...props}
      ref={ref}
      className={mergeClassName<BaseCheckbox.Root.State>(styles.root, className)}
    />
  );
});

export const CheckboxIndicator = forwardRef<HTMLSpanElement, CheckboxIndicatorProps>(
  function CheckboxIndicator({className, children, ...props}, ref) {
    return (
      <BaseCheckbox.Indicator
        {...props}
        ref={ref}
        className={mergeClassName<BaseCheckbox.Indicator.State>(styles.indicator, className)}
      >
        {children ?? <CheckIcon className={styles.check} aria-hidden="true" />}
      </BaseCheckbox.Indicator>
    );
  },
);

export const Checkbox = {
  Root: CheckboxRoot,
  Indicator: CheckboxIndicator,
} as const;
