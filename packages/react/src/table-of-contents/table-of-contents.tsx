import type {AnchorHTMLAttributes, HTMLAttributes, ReactNode, Ref} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './table-of-contents.module.css';

export interface TableOfContentsRootProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  readonly ref?: Ref<HTMLElement> | undefined;
  /** Visible heading above the links. */
  readonly title?: ReactNode;
}

export function TableOfContents({
  ref,
  title = 'On this page',
  children,
  className,
  ...props
}: TableOfContentsRootProps) {
  return (
    <nav
      {...props}
      ref={ref}
      aria-label={props['aria-label'] ?? 'Table of contents'}
      className={classes(styles.root, className)}
    >
      <div className={styles.title}>{title}</div>
      <ol className={styles.list}>{children}</ol>
    </nav>
  );
}

export interface TableOfContentsItemProps extends HTMLAttributes<HTMLLIElement> {
  readonly ref?: Ref<HTMLLIElement> | undefined;
}

export function TableOfContentsItem({ref, className, ...props}: TableOfContentsItemProps) {
  return <li {...props} ref={ref} className={classes(styles.item, className)} />;
}

export interface TableOfContentsLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  readonly ref?: Ref<HTMLAnchorElement> | undefined;
  /** Marks the section in view and sets `aria-current="location"`. */
  readonly active?: boolean;
}

export function TableOfContentsLink({
  ref,
  active = false,
  children,
  className,
  ...props
}: TableOfContentsLinkProps) {
  return (
    <a
      {...props}
      ref={ref}
      aria-current={active ? 'location' : props['aria-current']}
      data-active={active ? '' : undefined}
      className={classes(styles.link, className)}
    >
      <span className={styles.label}>{children}</span>
    </a>
  );
}
