import {forwardRef, type HTMLAttributes} from 'react';
import styles from './stack.module.css';
import {classes} from './shared.js';

export type StackDirection = 'row' | 'column';
export type StackGap = 'xs' | 'sm' | 'md' | 'lg';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';
export type StackWrap = 'wrap' | 'nowrap';

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  readonly direction?: StackDirection;
  readonly gap?: StackGap;
  readonly align?: StackAlign;
  readonly wrap?: StackWrap;
}

const gapClasses: Readonly<Record<StackGap, string | undefined>> = {
  xs: styles.gapXs,
  sm: styles.gapSm,
  md: undefined,
  lg: styles.gapLg,
};

const alignClasses: Readonly<Record<StackAlign, string | undefined>> = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
  stretch: undefined,
};

export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  {
    direction = 'column',
    gap = 'md',
    align = 'stretch',
    wrap = 'nowrap',
    className,
    ...props
  },
  ref,
) {
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
});
