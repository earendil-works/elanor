import {createElement, forwardRef, type HTMLAttributes} from 'react';
import styles from './heading.module.css';
import {classes} from '../utils/class-names.ts';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = 1 | 2 | 3;

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  readonly level: HeadingLevel;
  readonly size?: HeadingSize;
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  {level, size = 3, className, ...props},
  ref,
) {
  return createElement(`h${level}`, {
    ...props,
    ref,
    className: classes(styles.heading, styles[`heading${size}`], className),
  });
});
