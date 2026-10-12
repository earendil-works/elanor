import {Separator as BaseSeparator} from '@base-ui/react/separator';
import {forwardRef} from 'react';
import styles from './separator.module.css';
import {useSurfaceClassName} from '../appearance/appearance.tsx';
import {classes, mergeClassName} from '../utils/class-names.ts';

export type {SeparatorState} from '@base-ui/react/separator';

export interface SeparatorProps extends BaseSeparator.Props {}

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  {className, ...props},
  ref,
) {
  const surfaceClassName = useSurfaceClassName();
  return (
    <BaseSeparator
      data-outline={props.orientation === 'vertical' ? 'line-vertical' : 'line'}
      data-outline-focus="self"
      {...props}
      ref={ref}
      className={mergeClassName<BaseSeparator.State>(classes(styles.root, surfaceClassName), className)}
    />
  );
});
