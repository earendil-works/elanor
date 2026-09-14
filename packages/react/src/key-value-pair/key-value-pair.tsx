import {forwardRef, type HTMLAttributes, type ReactNode} from 'react';
import styles from './key-value-pair.module.css';
import {classes} from '../utils/class-names.ts';

export interface KeyValuePairProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  readonly label: ReactNode;
  readonly value: ReactNode;
}

export const KeyValuePair = forwardRef<HTMLDivElement, KeyValuePairProps>(
  function KeyValuePair({label, value, className, ...props}, ref) {
    return (
      <div {...props} ref={ref} className={classes(styles.root, className)}>
        <span className={styles.key}>{label}:</span>
        <span className={styles.value}>{value}</span>
      </div>
    );
  },
);
