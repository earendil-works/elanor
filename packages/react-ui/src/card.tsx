import {forwardRef, type HTMLAttributes, type ReactNode} from 'react';
import styles from './card.module.css';
import {classes} from './shared.ts';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  readonly label?: ReactNode;
  readonly value?: ReactNode;
  readonly description?: ReactNode;
  readonly padded?: boolean;
  readonly children?: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {label, value, description, padded = true, children, className, ...props},
  ref,
) {
  return (
    <div
      {...props}
      ref={ref}
      className={classes(styles.root, padded && styles.padded, className)}
    >
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
});
