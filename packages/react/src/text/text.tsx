import {createElement, forwardRef, type ForwardRefExoticComponent, type HTMLAttributes, type RefAttributes} from 'react';
import styles from './text.module.css';
import {classes} from '../utils/class-names.ts';

type ParagraphProps = HTMLAttributes<HTMLParagraphElement> & {
  readonly as?: 'p';
};

type SpanProps = HTMLAttributes<HTMLSpanElement> & {
  readonly as: 'span';
};

export type TextProps = ParagraphProps | SpanProps;

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {as = 'p', className, ...props},
  ref,
) {
  if (as !== 'p' && as !== 'span') {
    throw new TypeError(`Text does not support as="${as}". Use "p" or "span".`);
  }

  return createElement(as, {
    ...props,
    ref,
    className: classes(styles.text, as === 'p' && styles.paragraph, className),
  });
}) as ForwardRefExoticComponent<
  | (ParagraphProps & RefAttributes<HTMLParagraphElement>)
  | (SpanProps & RefAttributes<HTMLSpanElement>)
>;
