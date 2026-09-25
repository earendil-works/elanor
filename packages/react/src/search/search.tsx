import {Input as BaseInput} from '@base-ui/react/input';
import {SearchIcon} from '@earendil-works/elanor-icons-react/search';
import {forwardRef, type ReactNode} from 'react';
import styles from './search.module.css';
import {classes, mergeClassName} from '../utils/class-names.ts';

const inputTypes = ['text', 'search'] as const;

export interface SearchProps extends Omit<BaseInput.Props, 'type'> {
  readonly type?: (typeof inputTypes)[number];
  readonly icon?: ReactNode;
  readonly endAdornment?: ReactNode;
  readonly rootClassName?: string;
}

export const Search = forwardRef<HTMLInputElement, SearchProps>(function Search(
  {icon, endAdornment, rootClassName, className, type = 'search', ...props},
  ref,
) {
  if (!inputTypes.includes(type)) {
    throw new TypeError(`Search does not support type="${type}". Use one of: ${inputTypes.join(', ')}.`);
  }

  return (
    <span className={classes(styles.root, rootClassName)}>
      <span className={styles.icon} aria-hidden="true">
        {icon ?? <SearchIcon />}
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
