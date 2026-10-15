import {mergeProps} from '@base-ui/react/merge-props';
import {useRender} from '@base-ui/react/use-render';

import styles from './inline-code.module.css';

export interface InlineCodeProps extends useRender.ComponentProps<'code'> {}

/** Code within running text. Renders `code` by default. */
export function InlineCode({ref, render, ...props}: InlineCodeProps) {
  return useRender({
    defaultTagName: 'code',
    render,
    ref,
    props: mergeProps<'code'>({className: styles.root}, props),
  });
}
