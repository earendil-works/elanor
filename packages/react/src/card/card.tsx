import type {HTMLAttributes, ReactNode, Ref} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './card.module.css';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
  /** Names the metric, such as "Active projects". Ignored when `children` is set. */
  readonly label?: ReactNode;
  /** The metric, such as a count. Ignored when `children` is set. */
  readonly value?: ReactNode;
  /** Supporting text below the metric. Ignored when `children` is set. */
  readonly description?: ReactNode;
  /** Adds inner padding. Set `false` for edge-to-edge content. */
  readonly padded?: boolean;
  /** Custom content, replacing the metric layout. */
  readonly children?: ReactNode;
}

export function Card({
  ref,
  label,
  value,
  description,
  padded = true,
  children,
  className,
  ...props
}: CardProps) {
  return (
    <div {...props} ref={ref} className={classes(styles.root, padded && styles.padded, className)}>
      {children ?? (
        <>
          <div className={styles.content}>
            {label === undefined ? null : <div className={styles.label}>{label}</div>}
            {value === undefined ? null : <div className={styles.value}>{value}</div>}
          </div>
          {description === undefined ? null : (
            <div className={styles.description}>{description}</div>
          )}
        </>
      )}
    </div>
  );
}
