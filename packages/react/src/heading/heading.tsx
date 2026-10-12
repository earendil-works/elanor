import {createElement, type HTMLAttributes, type Ref} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './heading.module.css';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = 1 | 2 | 3;

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  readonly ref?: Ref<HTMLHeadingElement> | undefined;
  readonly level: HeadingLevel;
  readonly size?: HeadingSize;
}

export function Heading({ref, level, size = 3, className, ...props}: HeadingProps) {
  return createElement(`h${level}`, {
    ...props,
    ref,
    className: classes(styles.heading, styles[`heading${size}`], className),
  });
}
