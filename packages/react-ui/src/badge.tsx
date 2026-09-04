import {forwardRef, type HTMLAttributes} from 'react';
import styles from './badge.module.css';
import {classes} from './shared.js';

export type BadgeTone = 'neutral' | 'information' | 'positive' | 'warning' | 'negative';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  readonly tone?: BadgeTone;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {tone = 'neutral', className, ...props},
  ref,
) {
  return <span {...props} ref={ref} className={classes(styles.root, tone !== 'neutral' && styles[tone], className)} />;
});
