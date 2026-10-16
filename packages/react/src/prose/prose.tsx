import {mergeProps} from '@base-ui/react/merge-props';
import {useRender} from '@base-ui/react/use-render';

import styles from './prose.module.css';

export interface ProseProps extends useRender.ComponentProps<'div'> {}

/**
 * A container for long-form content, such as documentation or an article. It sets the prose text
 * context, so text components inside use the prose styles, and spaces the blocks inside with
 * `semantic.dimension.space.flow` tokens. Renders a `div` by default.
 */
const proseProps = {className: styles.root, 'data-text-context': 'prose'};

export function Prose({ref, render, ...props}: ProseProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>(proseProps, props),
  });
}
