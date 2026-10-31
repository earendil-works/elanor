import type {ReactNode} from 'react';

import styles from './button.module.css';

interface ButtonContentProps {
  readonly iconStart: ReactNode;
  readonly iconEnd: ReactNode;
  readonly children: ReactNode;
}

/** The label between the decorative icons of Button and ButtonLink. */
export function ButtonContent({iconStart, iconEnd, children}: ButtonContentProps) {
  return (
    <>
      {iconStart ? (
        <span className={styles.icon} aria-hidden="true">
          {iconStart}
        </span>
      ) : null}
      {children}
      {iconEnd ? (
        <span className={styles.icon} aria-hidden="true">
          {iconEnd}
        </span>
      ) : null}
    </>
  );
}
