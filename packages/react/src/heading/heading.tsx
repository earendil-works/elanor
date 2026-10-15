import {createElement, type HTMLAttributes, type Ref} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './heading.module.css';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingVariant = 'app' | 'marketing';

interface HeadingBaseProps extends HTMLAttributes<HTMLHeadingElement> {
  readonly ref?: Ref<HTMLHeadingElement> | undefined;
  /** Heading level. Follow the page outline; `level` doesn't change the size. */
  readonly level: HeadingLevel;
}

interface AppHeadingProps extends HeadingBaseProps {
  /** Heading style: `app` for interfaces, `marketing` for promotional pages. */
  readonly variant?: 'app';
  /** Visual size, from `1` (largest) to `6`, one per `semantic.typography.heading.app` style. */
  readonly size?: HeadingSize;
}

interface MarketingHeadingProps extends HeadingBaseProps {
  /** Heading style: `app` for interfaces, `marketing` for promotional pages. */
  readonly variant: 'marketing';
  /**
   * Visual size, from `1` (largest) to `6`, one per `semantic.typography.heading.marketing` style,
   * or `display` for oversized promotional text above that hierarchy.
   */
  readonly size?: HeadingSize | 'display';
}

export type HeadingProps = AppHeadingProps | MarketingHeadingProps;

export function Heading({
  ref,
  level,
  variant = 'app',
  size = 6,
  className,
  ...props
}: HeadingProps) {
  return createElement(`h${level}`, {
    ...props,
    ref,
    className: classes(
      styles.heading,
      styles[`${variant}${size === 'display' ? 'Display' : size}`],
      className,
    ),
  });
}
