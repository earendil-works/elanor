import {Checkbox as BaseCheckbox} from '@base-ui/react/checkbox';
import {forwardRef} from 'react';
import styles from './checkbox.module.css';
import mark from '../utils/mark.module.css';
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
    // Without custom content, the indicator is the mark: a check, or a dash while indeterminate.
    const isMark = children === undefined || children === null;
    const indicatorClassName = (state: BaseCheckbox.Indicator.State) =>
      classes(styles.indicator, isMark && styles.mark, isMark && (state.indeterminate ? mark.dash : mark.check));
    return (
      <BaseCheckbox.Indicator
        {...props}
        ref={ref}
        className={mergeClassName<BaseCheckbox.Indicator.State>(indicatorClassName, className)}
      >
        {children}
      </BaseCheckbox.Indicator>
    );
  },
);

export const Checkbox = {
  Root: CheckboxRoot,
  Indicator: CheckboxIndicator,
} as const;
