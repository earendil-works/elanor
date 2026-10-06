import {Checkbox as BaseCheckbox} from '@base-ui/react/checkbox';
import {CheckIcon} from '@earendil-works/elanor-icons-react';
import {forwardRef} from 'react';
import styles from './checkbox.module.css';
import outline from '../utils/outline.module.css';
import {classes, mergeClassName} from '../utils/class-names.ts';

export type {
  CheckboxRootState,
  CheckboxRootChangeEventReason,
  CheckboxRootChangeEventDetails,
  CheckboxIndicatorState,
} from '@base-ui/react/checkbox';

export type CheckboxRootProps = BaseCheckbox.Root.Props;
export type CheckboxIndicatorProps = BaseCheckbox.Indicator.Props;

export const CheckboxRoot = forwardRef<HTMLElement, CheckboxRootProps>(
  function CheckboxRoot({className, children, ...props}, ref) {
    return (
      <BaseCheckbox.Root
        {...props}
        ref={ref}
        className={mergeClassName<BaseCheckbox.Root.State>(styles.root, className)}
      >
        {/* The visible control is smaller than the target, and carries the outline. */}
        <span className={classes(styles.box, outline.outline)} data-outline="box-small" aria-hidden="true" />
        {children}
      </BaseCheckbox.Root>
    );
  },
);

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
