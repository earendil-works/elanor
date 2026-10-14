import {forwardRef, type AnchorHTMLAttributes} from 'react';
import styles from './link.module.css';
import {useSurfaceClassName} from '../appearance/appearance.tsx';
import {classes} from '../utils/class-names.ts';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {className, ...props},
  ref,
) {
  const surfaceClassName = useSurfaceClassName();
  return <a data-outline="box-small" data-outline-focus="self" data-outline-band="none" {...props} ref={ref} className={classes(styles.root, surfaceClassName, className)} />;
});
