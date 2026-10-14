import type {LabelHTMLAttributes, ReactNode, Ref} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './selection-control-and-label.module.css';

export interface SelectionControlAndLabelProps extends Omit<
  LabelHTMLAttributes<HTMLLabelElement>,
  'children'
> {
  readonly ref?: Ref<HTMLLabelElement> | undefined;
  readonly control: ReactNode;
  readonly children: ReactNode;
}

export function SelectionControlAndLabel({
  ref,
  control,
  children,
  className,
  ...props
}: SelectionControlAndLabelProps) {
  return (
    <label {...props} ref={ref} className={classes(styles.root, className)}>
      <span className={styles.control}>{control}</span>
      <span className={styles.content}>
        <span className={styles.label}>{children}</span>
      </span>
    </label>
  );
}
