import {mergeProps} from '@base-ui/react/merge-props';
import {useRender} from '@base-ui/react/use-render';

import styles from './inline-code.module.css';

export type InlineCodeVariant = 'soft' | 'plain';

export interface InlineCodeProps extends useRender.ComponentProps<'code'> {
  /** Visual treatment. `plain` removes the fill.
   * @default 'soft'
   */
  readonly variant?: InlineCodeVariant | undefined;
}

/** Code within running text. Renders `code` by default. */
export function InlineCode({ref, render, variant = 'soft', ...props}: InlineCodeProps) {
  return useRender({
    defaultTagName: 'code',
    render,
    ref,
    props: {...mergeProps<'code'>({className: styles.root}, props), 'data-variant': variant},
  });
}
