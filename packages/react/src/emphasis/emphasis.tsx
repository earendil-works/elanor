import type {HTMLAttributes, Ref} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './emphasis.module.css';

export interface EmphasisProps extends HTMLAttributes<HTMLElement> {
  readonly ref?: Ref<HTMLElement> | undefined;
}

/** Stressed emphasis within running text. */
export function Emphasis({ref, className, ...props}: EmphasisProps) {
  return <em {...props} ref={ref} className={classes(styles.root, className)} />;
}
