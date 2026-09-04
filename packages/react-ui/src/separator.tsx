import {Separator as BaseSeparator} from '@base-ui/react/separator';
import {forwardRef} from 'react';
import styles from './separator.module.css';
import {mergeClassName} from './shared.ts';

export type {SeparatorState} from '@base-ui/react/separator';

export interface SeparatorProps extends BaseSeparator.Props {}

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  {className, ...props},
  ref,
) {
  return (
    <BaseSeparator
      {...props}
      ref={ref}
      className={mergeClassName<BaseSeparator.State>(styles.root, className)}
    />
  );
});
