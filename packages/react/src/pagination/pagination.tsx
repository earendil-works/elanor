import {forwardRef, type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode} from 'react';
import styles from './pagination.module.css';
import {classes} from '../utils/class-names.ts';

export interface PaginationProps extends HTMLAttributes<HTMLElement> {
  readonly summary?: ReactNode;
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {summary, children, className, ...props},
  ref,
) {
  return (
    <nav {...props} ref={ref} aria-label={props['aria-label'] ?? 'Pagination'} className={classes(styles.root, className)}>
      {summary ? <span className={styles.summary}>{summary}</span> : null}
      <span className={styles.actions}>{children}</span>
    </nav>
  );
});

export interface PaginationLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  readonly disabled?: boolean;
}

export const PaginationLink = forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  function PaginationLink({disabled = false, className, tabIndex, href, onClick, onAuxClick, ...props}, ref) {
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
      />
    );
  },
);

export interface PaginationSeparatorProps extends HTMLAttributes<HTMLSpanElement> {}

export const PaginationSeparator = forwardRef<HTMLSpanElement, PaginationSeparatorProps>(
  function PaginationSeparator({className, children = '|', ...props}, ref) {
    return (
      <span {...props} ref={ref} aria-hidden="true" className={classes(styles.separator, className)}>
        {children}
      </span>
    );
  },
);
