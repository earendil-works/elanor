import {mergeProps} from '@base-ui/react/merge-props';
import {useRender} from '@base-ui/react/use-render';
import {forwardRef} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './container.module.css';

export type ContainerWidth = 'capped' | 'full';

export interface ContainerProps extends useRender.ComponentProps<'div'> {
  /** The content cap is independent of any surrounding side regions. */
  readonly width?: ContainerWidth;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(function Container(
  {width = 'capped', render, ...props},
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>(
      {
        className: classes(styles.root, width === 'full' && styles.full),
      },
      props,
    ),
  });
});
