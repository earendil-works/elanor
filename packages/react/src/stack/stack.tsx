import type {HTMLAttributes, Ref} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './stack.module.css';

export type StackDirection = 'row' | 'column';
export type StackGap = 'xxSmall' | 'xSmall' | 'small' | 'medium' | 'large' | 'xLarge' | 'auto';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';
export type StackWrap = 'wrap' | 'nowrap';

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
  readonly direction?: StackDirection;
  readonly gap?: StackGap;
  readonly align?: StackAlign;
  readonly wrap?: StackWrap;
}

const gapClasses: Readonly<Record<StackGap, string | undefined>> = {
  xxSmall: styles.gapXxs,
  xSmall: styles.gapXs,
  small: styles.gapSm,
  medium: undefined,
  large: styles.gapLg,
  xLarge: styles.gapXl,
  auto: styles.gapAuto,
};

const alignClasses: Readonly<Record<StackAlign, string | undefined>> = {
  start: undefined,
  center: styles.alignCenter,
  end: styles.alignEnd,
  stretch: styles.alignStretch,
};

export function Stack({
  ref,
  direction = 'column',
  gap = 'medium',
  align = 'start',
  wrap = 'nowrap',
  className,
  ...props
}: StackProps) {
  return (
    <div
      {...props}
      ref={ref}
      className={classes(
        styles.root,
        direction === 'row' && styles.row,
        gapClasses[gap],
        alignClasses[align],
        wrap === 'wrap' && styles.wrap,
        className,
      )}
    />
  );
}
