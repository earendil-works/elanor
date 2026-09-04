import {Input as BaseInput} from '@base-ui/react/input';
import {forwardRef, type ReactNode} from 'react';
import styles from './search.module.css';
import {classes, mergeClassName} from './shared.ts';

export interface SearchProps extends Omit<BaseInput.Props, 'render'> {
  readonly icon?: ReactNode;
  readonly endAdornment?: ReactNode;
  readonly rootClassName?: string;
}

export const Search = forwardRef<HTMLInputElement, SearchProps>(function Search(
  {icon, endAdornment, rootClassName, className, type = 'search', ...props},
  ref,
) {
  return (
    <span className={classes(styles.root, rootClassName)}>
      <span className={styles.icon} aria-hidden="true">
        {icon ?? <span className={styles.searchGlyph} />}
      </span>
      <BaseInput
        {...props}
        ref={ref}
        type={type}
        className={mergeClassName<BaseInput.State>(styles.input, className)}
      />
      {endAdornment ? <span className={styles.adornment}>{endAdornment}</span> : null}
    </span>
  );
});

export interface SearchAndFilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly filters?: ReactNode;
  readonly search?: ReactNode;
}

export const SearchAndFilterBar = forwardRef<HTMLDivElement, SearchAndFilterBarProps>(
  function SearchAndFilterBar({filters, search, children, className, ...props}, ref) {
    return (
      <div {...props} ref={ref} className={classes(styles.bar, className)}>
        <div className={styles.filters}>{filters ?? children}</div>
        {search ? <div className={styles.search}>{search}</div> : null}
      </div>
    );
  },
);
