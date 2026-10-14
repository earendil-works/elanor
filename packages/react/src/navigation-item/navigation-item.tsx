import {forwardRef, type AnchorHTMLAttributes, type ReactNode} from 'react';
import styles from './navigation-item.module.css';
import {useSurfaceClassName} from '../appearance/appearance.tsx';
import {classes} from '../utils/class-names.ts';

export interface NavigationItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  readonly active?: boolean;
  readonly indicator?: ReactNode;
}

export const NavigationItem = forwardRef<HTMLAnchorElement, NavigationItemProps>(
  function NavigationItem({active = false, indicator, className, children, ...props}, ref) {
    const surfaceClassName = useSurfaceClassName();
    return (
      <a
        data-outline="line"
        data-outline-focus="self"
        data-outline-edge="block-end"
        {...props}
        ref={ref}
        aria-current={active ? 'page' : props['aria-current']}
        data-active={active ? '' : undefined}
        className={classes(styles.navigationItem, surfaceClassName, className)}
      >
        <span className={styles.label}>{children}</span>
        {indicator ? <span className={styles.icon}>{indicator}</span> : null}
      </a>
    );
  },
);
