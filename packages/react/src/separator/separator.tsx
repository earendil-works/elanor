import {Separator as BaseSeparator} from '@base-ui/react/separator';

import {mergeClassName} from '../utils/class-names.ts';

import styles from './separator.module.css';

export type {SeparatorState} from '@base-ui/react/separator';

export interface SeparatorProps extends BaseSeparator.Props {}

export function Separator({ref, className, ...props}: SeparatorProps) {
  return (
    <BaseSeparator
      {...props}
      ref={ref}
      className={mergeClassName<BaseSeparator.State>(styles.root, className)}
    />
  );
}
