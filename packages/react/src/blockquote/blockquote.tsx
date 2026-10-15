import type {BlockquoteHTMLAttributes, Ref} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './blockquote.module.css';

export interface BlockquoteProps extends BlockquoteHTMLAttributes<HTMLQuoteElement> {
  readonly ref?: Ref<HTMLQuoteElement> | undefined;
}

/** A quotation set apart from the surrounding text. Put `Text` and other blocks inside. */
export function Blockquote({ref, className, ...props}: BlockquoteProps) {
  return <blockquote {...props} ref={ref} className={classes(styles.root, className)} />;
}
