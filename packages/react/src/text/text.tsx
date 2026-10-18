import {mergeProps} from '@base-ui/react/merge-props';
import {useRender} from '@base-ui/react/use-render';

import {classes} from '../utils/class-names.ts';

import styles from './text.module.css';

export type TextHierarchy = 'primary' | 'secondary';

export interface TextProps extends useRender.ComponentProps<'p'> {
  /** Visual emphasis. `secondary` is supporting text, such as hints and metadata, in the secondary style and color. */
  readonly hierarchy?: TextHierarchy;
}

export function Text({ref, render, hierarchy = 'primary', ...props}: TextProps) {
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: mergeProps<'p'>(
      {className: classes(styles.text, hierarchy === 'secondary' && styles.secondary)},
      props,
    ),
  });
}
