import type {HTMLAttributes, Ref} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './mention.module.css';

export interface MentionProps extends HTMLAttributes<HTMLSpanElement> {
  readonly ref?: Ref<HTMLSpanElement> | undefined;
}

/** A mention in text, such as "@pi" calling someone in: set apart as a pill, in line with the text around it. */
export function Mention({ref, className, ...props}: MentionProps) {
  return <span {...props} ref={ref} className={classes(styles.root, className)} />;
}
