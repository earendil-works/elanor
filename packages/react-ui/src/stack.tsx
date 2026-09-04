import {forwardRef, type HTMLAttributes} from 'react';
import styles from './stack.module.css';
import {classes} from './shared.ts';

export type StackDirection = 'row' | 'column';
export type StackGap = 'xxSmall' | 'xSmall' | 'small' | 'medium' | 'large' | 'xLarge' | 'auto';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';
export type StackWrap = 'wrap' | 'nowrap';

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
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
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
  stretch: undefined,
};

export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  {
    direction = 'column',
    gap = 'medium',
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
