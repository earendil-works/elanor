import {forwardRef, type LabelHTMLAttributes, type ReactNode} from 'react';
import styles from './selection-control-label.module.css';
import {classes} from '../utils/class-names.ts';

export interface SelectionControlAndLabelProps
  extends Omit<LabelHTMLAttributes<HTMLLabelElement>, 'children'> {
  readonly control: ReactNode;
  readonly children: ReactNode;
  readonly description?: ReactNode;
}

export const SelectionControlAndLabel = forwardRef<
  HTMLLabelElement,
  SelectionControlAndLabelProps
>(
  function SelectionControlAndLabel({control, children, description, className, ...props}, ref) {
    return (
      <label {...props} ref={ref} className={classes(styles.root, className)}>
        <span className={styles.control}>{control}</span>
        <span className={styles.content}>
          <span className={styles.label}>{children}</span>
          {description ? <span className={styles.description}>{description}</span> : null}
        </span>
      </label>
    );
  },
);
