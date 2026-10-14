import type {ReactNode, Ref} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './search-and-filter-bar.module.css';

export interface SearchAndFilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
  /** Filter controls, such as Dropdowns. Falls back to `children`. */
  readonly filters?: ReactNode;
  /** The search input, usually a Search. */
  readonly search?: ReactNode;
}

export function SearchAndFilterBar({
  ref,
  filters,
  search,
  children,
  className,
  ...props
}: SearchAndFilterBarProps) {
  return (
    <div {...props} ref={ref} className={classes(styles.bar, className)}>
      <div className={styles.layout}>
        <div className={styles.search}>{search}</div>
        <div className={styles.filters}>{filters ?? children}</div>
      </div>
    </div>
  );
}
