import {forwardRef, type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode} from 'react';
import styles from './table-of-contents.module.css';
import {classes} from '../utils/class-names.ts';

export interface TableOfContentsProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  readonly title?: ReactNode;
}

export const TableOfContents = forwardRef<HTMLElement, TableOfContentsProps>(
  function TableOfContents({title = 'On this page', children, className, ...props}, ref) {
    return (
      <nav {...props} ref={ref} aria-label={props['aria-label'] ?? 'Table of contents'} className={classes(styles.root, className)}>
        <div className={styles.title}>{title}</div>
        <ol className={styles.list}>{children}</ol>
      </nav>
    );
  },
);

export interface TableOfContentsItemProps extends HTMLAttributes<HTMLLIElement> {}

export const TableOfContentsItem = forwardRef<HTMLLIElement, TableOfContentsItemProps>(
  function TableOfContentsItem({className, ...props}, ref) {
    return <li {...props} ref={ref} className={classes(styles.item, className)} />;
  },
);

export interface TableOfContentsLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  readonly active?: boolean;
}

export const TableOfContentsLink = forwardRef<HTMLAnchorElement, TableOfContentsLinkProps>(
  function TableOfContentsLink({active = false, className, ...props}, ref) {
    return (
      <a
        {...props}
        ref={ref}
        aria-current={active ? 'location' : props['aria-current']}
        data-active={active ? '' : undefined}
        className={classes(styles.link, className)}
      />
    );
  },
);
