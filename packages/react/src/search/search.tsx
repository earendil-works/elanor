import {Input as BaseInput} from '@base-ui/react/input';
import {forwardRef, type ReactNode} from 'react';
import styles from './search.module.css';
import {classes, mergeClassName} from '../utils/class-names.ts';

export interface SearchProps extends BaseInput.Props {
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
