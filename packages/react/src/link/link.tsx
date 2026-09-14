import {forwardRef, type AnchorHTMLAttributes} from 'react';
import styles from './link.module.css';
import {classes} from '../utils/class-names.ts';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {className, ...props},
  ref,
) {
  return <a {...props} ref={ref} className={classes(styles.root, className)} />;
});
