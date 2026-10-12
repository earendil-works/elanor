import type {AnchorHTMLAttributes, HTMLAttributes, Ref} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './pagination.module.css';

export interface PaginationRootProps extends HTMLAttributes<HTMLElement> {
  readonly ref?: Ref<HTMLElement> | undefined;
  readonly summary?: string;
}

export function Pagination({ref, summary, children, className, ...props}: PaginationRootProps) {
  return (
    <nav
      {...props}
      ref={ref}
      aria-label={props['aria-label'] ?? 'Pagination'}
      className={classes(styles.root, className)}
    >
      {summary ? <span className={styles.summary}>{summary}</span> : null}
      <span className={styles.actions}>{children}</span>
    </nav>
  );
}

export interface PaginationLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  readonly ref?: Ref<HTMLAnchorElement> | undefined;
  readonly disabled?: boolean;
}

export function PaginationLink({
  ref,
  disabled = false,
  className,
  children,
  tabIndex,
  href,
  onClick,
  onAuxClick,
  ...props
}: PaginationLinkProps) {
  return (
    <a
      {...props}
      ref={ref}
      href={disabled ? undefined : href}
      role={disabled ? 'link' : props.role}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : tabIndex}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClick?.(event);
      }}
      onAuxClick={(event) => {
        if (disabled) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onAuxClick?.(event);
      }}
      className={classes(styles.link, className)}
    >
      {children}
    </a>
  );
}

export interface PaginationSeparatorProps extends HTMLAttributes<HTMLSpanElement> {
  readonly ref?: Ref<HTMLSpanElement> | undefined;
}

export function PaginationSeparator({
  ref,
  className,
  children = '|',
  ...props
}: PaginationSeparatorProps) {
  return (
    <span {...props} ref={ref} aria-hidden="true" className={classes(styles.separator, className)}>
      {children}
    </span>
  );
}
