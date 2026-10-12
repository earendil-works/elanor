import {createElement, type ComponentPropsWithRef} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './text.module.css';

type ParagraphProps = ComponentPropsWithRef<'p'> & {
  readonly as?: 'p';
};

type SpanProps = ComponentPropsWithRef<'span'> & {
  readonly as: 'span';
};

export type TextProps = ParagraphProps | SpanProps;

export function Text({ref, as = 'p', className, ...props}: TextProps): React.JSX.Element {
  if (as !== 'p' && as !== 'span') {
    throw new TypeError(`Text does not support as="${as}". Use "p" or "span".`);
  }

  return createElement(as, {
    ...props,
    ref,
    className: classes(styles.text, as === 'p' && styles.paragraph, className),
  });
}
