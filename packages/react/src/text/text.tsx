import {mergeProps} from '@base-ui/react/merge-props';
import {useRender} from '@base-ui/react/use-render';

import styles from './text.module.css';

export interface TextProps extends useRender.ComponentProps<'p'> {}

export function Text({ref, render, ...props}: TextProps) {
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: mergeProps<'p'>({className: styles.text}, props),
  });
}
