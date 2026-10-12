import type {AnchorHTMLAttributes, Ref} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './link.module.css';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  readonly ref?: Ref<HTMLAnchorElement> | undefined;
}

export function Link({ref, className, children, ...props}: LinkProps) {
  return (
    <a {...props} ref={ref} className={classes(styles.root, className)}>
      {children}
    </a>
  );
}
