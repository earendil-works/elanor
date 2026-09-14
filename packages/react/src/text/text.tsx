import {forwardRef, type HTMLAttributes} from 'react';
import styles from './text.module.css';
import {classes} from '../utils/class-names.ts';

export interface TextProps extends HTMLAttributes<HTMLSpanElement> {}

export const Text = forwardRef<HTMLSpanElement, TextProps>(function Text(
  {className, ...props},
  ref,
) {
  return <span {...props} ref={ref} className={classes(styles.text, className)} />;
});
