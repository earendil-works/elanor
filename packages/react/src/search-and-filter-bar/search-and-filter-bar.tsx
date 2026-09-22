import {forwardRef, type ReactNode} from 'react';
import styles from './search-and-filter-bar.module.css';
import {classes} from '../utils/class-names.ts';

export interface SearchAndFilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly filters?: ReactNode;
  readonly search?: ReactNode;
}

export const SearchAndFilterBar = forwardRef<HTMLDivElement, SearchAndFilterBarProps>(
  function SearchAndFilterBar({filters, search, children, className, ...props}, ref) {
    return (
      <div {...props} ref={ref} className={classes(styles.bar, className)}>
        <div className={styles.layout}>
          <div className={styles.search}>{search}</div>
          <div className={styles.filters}>{filters ?? children}</div>
        </div>
      </div>
    );
  },
);
