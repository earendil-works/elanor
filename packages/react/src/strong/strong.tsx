import type {HTMLAttributes, Ref} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './strong.module.css';

export interface StrongProps extends HTMLAttributes<HTMLElement> {
  readonly ref?: Ref<HTMLElement> | undefined;
}

/** Text of strong importance within running text. */
export function Strong({ref, className, ...props}: StrongProps) {
  return <strong {...props} ref={ref} className={classes(styles.root, className)} />;
}
