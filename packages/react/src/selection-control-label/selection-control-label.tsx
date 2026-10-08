import {forwardRef, type LabelHTMLAttributes, type ReactNode} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './selection-control-label.module.css';

export interface SelectionControlAndLabelProps extends Omit<
  LabelHTMLAttributes<HTMLLabelElement>,
  'children'
> {
  readonly control: ReactNode;
  readonly children: ReactNode;
}

export const SelectionControlAndLabel = forwardRef<HTMLLabelElement, SelectionControlAndLabelProps>(
  function SelectionControlAndLabel({control, children, className, ...props}, ref) {
    return (
      <label {...props} ref={ref} className={classes(styles.root, className)}>
        <span className={styles.control}>{control}</span>
        <span className={styles.content}>
          <span className={styles.label}>{children}</span>
        </span>
      </label>
    );
  },
);
