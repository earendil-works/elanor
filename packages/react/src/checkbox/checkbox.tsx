import {Checkbox as BaseCheckbox} from '@base-ui/react/checkbox';
import {CheckIcon} from '@earendil-works/elanor-icons-react';
import type {ComponentPropsWithRef} from 'react';

import {mergeClassName} from '../utils/class-names.ts';

import styles from './checkbox.module.css';

export type {
  CheckboxRootState,
  CheckboxRootChangeEventReason,
  CheckboxRootChangeEventDetails,
  CheckboxIndicatorState,
} from '@base-ui/react/checkbox';

export type CheckboxRootProps = ComponentPropsWithRef<typeof BaseCheckbox.Root>;
export type CheckboxIndicatorProps = BaseCheckbox.Indicator.Props;

export function CheckboxRoot({ref, className, ...props}: CheckboxRootProps) {
  return (
    <BaseCheckbox.Root
      {...props}
      ref={ref}
      className={mergeClassName<BaseCheckbox.Root.State>(styles.root, className)}
    />
  );
}

export function CheckboxIndicator({
  ref,
  className,
  children,
  keepMounted = true,
  ...props
}: CheckboxIndicatorProps) {
  return (
    <BaseCheckbox.Indicator
      {...props}
      keepMounted={keepMounted}
      ref={ref}
      className={mergeClassName<BaseCheckbox.Indicator.State>(styles.indicator, className)}
    >
      {children ?? <CheckIcon className={styles.check} aria-hidden="true" />}
    </BaseCheckbox.Indicator>
  );
}
