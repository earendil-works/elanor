import {createElement, forwardRef, type HTMLAttributes} from 'react';
import styles from './content.module.css';
import {classes} from './shared.js';

export type TextTone = 'primary' | 'secondary' | 'positive' | 'negative';
export type TextSize = 'body' | 'small';
export type LiveMode = 'off' | 'polite' | 'assertive';

interface TextStyleProps {
  readonly tone?: TextTone;
  readonly size?: TextSize;
  readonly live?: LiveMode;
}

export interface TextProps extends HTMLAttributes<HTMLSpanElement>, TextStyleProps {}
export interface ParagraphProps extends HTMLAttributes<HTMLParagraphElement>, TextStyleProps {}
export interface CodeProps extends HTMLAttributes<HTMLElement> {
  readonly tone?: TextTone;
  readonly live?: LiveMode;
}

const textToneClasses: Readonly<Record<TextTone, string | undefined>> = {
  primary: undefined,
  secondary: styles.textSecondary,
  positive: styles.textPositive,
  negative: styles.textNegative,
};

function textClassName(
  tone: TextTone,
  size: TextSize,
  className: string | undefined,
): string {
  return classes(
    styles.text,
    textToneClasses[tone],
    size === 'small' && styles.textSmall,
    className,
  );
}

export const Text = forwardRef<HTMLSpanElement, TextProps>(function Text(
  {tone = 'primary', size = 'body', live = 'off', className, ...props},
  ref,
) {
  return (
    <span
      {...props}
      ref={ref}
      aria-live={live === 'off' ? undefined : live}
      className={textClassName(tone, size, className)}
    />
  );
});

export const Paragraph = forwardRef<HTMLParagraphElement, ParagraphProps>(function Paragraph(
  {tone = 'primary', size = 'body', live = 'off', className, ...props},
  ref,
) {
  return (
    <p
      {...props}
      ref={ref}
      aria-live={live === 'off' ? undefined : live}
      className={classes(styles.paragraph, textClassName(tone, size, className))}
    />
  );
});

export const Code = forwardRef<HTMLElement, CodeProps>(function Code(
  {tone = 'primary', live = 'off', className, ...props},
  ref,
) {
  return (
    <code
      {...props}
      ref={ref}
      aria-live={live === 'off' ? undefined : live}
      className={classes(styles.text, styles.code, textToneClasses[tone], className)}
    />
  );
});

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = 'large' | 'compact';

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  readonly level?: HeadingLevel;
  readonly size?: HeadingSize;
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  {level = 2, size = 'large', className, ...props},
  ref,
) {
  return createElement(`h${level}`, {
    ...props,
    ref,
    className: classes(styles.heading, size === 'compact' && styles.headingCompact, className),
  });
});

export type BoxPadding = 'none' | 'sm' | 'md' | 'lg';
export type BoxSurface = 'transparent' | 'primary' | 'subdued';

export interface BoxProps extends HTMLAttributes<HTMLDivElement> {
  readonly padding?: BoxPadding;
  readonly surface?: BoxSurface;
  readonly border?: boolean;
}

const paddingClasses: Readonly<Record<BoxPadding, string | undefined>> = {
  none: undefined,
  sm: styles.paddingSm,
  md: styles.paddingMd,
  lg: styles.paddingLg,
};

const surfaceClasses: Readonly<Record<BoxSurface, string | undefined>> = {
  transparent: undefined,
  primary: styles.surfacePrimary,
  subdued: styles.surfaceSubdued,
};

export const Box = forwardRef<HTMLDivElement, BoxProps>(function Box(
  {padding = 'none', surface = 'transparent', border = false, className, ...props},
  ref,
) {
  return (
    <div
      {...props}
      ref={ref}
      className={classes(
        styles.box,
        paddingClasses[padding],
        surfaceClasses[surface],
        border && styles.bordered,
        className,
      )}
    />
  );
});
