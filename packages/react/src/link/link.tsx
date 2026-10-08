import {forwardRef, type AnchorHTMLAttributes} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './link.module.css';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {className, children, ...props},
  ref,
) {
  return (
    <a {...props} ref={ref} className={classes(styles.root, className)}>
      {children}
    </a>
  );
});
