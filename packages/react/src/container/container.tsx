import {mergeProps} from '@base-ui/react/merge-props';
import {useRender} from '@base-ui/react/use-render';

import {classes} from '../utils/class-names.ts';

import styles from './container.module.css';

export type ContainerWidth = 'capped' | 'full';

export interface ContainerProps extends useRender.ComponentProps<'div'> {
  /** `capped` limits content to 1216px; `full` removes the cap. Both keep the gutters. */
  readonly width?: ContainerWidth;
}

export function Container({ref, width = 'capped', render, ...props}: ContainerProps) {
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
}
