import {mergeProps} from '@base-ui/react/merge-props';
import {useRender} from '@base-ui/react/use-render';
import {
  useLayoutEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type Ref,
} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './table-of-contents.module.css';

export interface TableOfContentsRootProps extends HTMLAttributes<HTMLElement> {
  readonly ref?: Ref<HTMLElement> | undefined;
}

/**
 * A `nav` named "Table of contents". Put a `List` of `Item`s inside, and an `Indicator` after it
 * to mark the active entry with a bar that moves.
 */
export function TableOfContents({ref, className, ...props}: TableOfContentsRootProps) {
  return (
    <nav
      {...props}
      ref={ref}
      aria-label={props['aria-label'] ?? 'Table of contents'}
      className={classes(styles.root, className)}
    />
  );
}

export interface TableOfContentsIndicatorProps extends useRender.ComponentProps<'span'> {}

interface ActiveEntry {
  readonly top: number;
  readonly height: number;
}

/**
 * A bar that marks the active entry and moves to the next one when `active` changes, like Tabs'
 * indicator. It measures the active link and sets `--active-entry-top` and
 * `--active-entry-height`; it stays hidden until it has measured, and the active entry draws its
 * own bar until then. Place it in Root, after the `List`.
 */
export function TableOfContentsIndicator({ref, render, ...props}: TableOfContentsIndicatorProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const [entry, setEntry] = useState<ActiveEntry | null>(null);

  // Measure the active link within the table of contents (the indicator's parent) after every
  // render and when the table of contents resizes.
  useLayoutEffect(() => {
    const root = elementRef.current?.parentElement;
    if (!root) return undefined;
    function measure(): void {
      const active = root?.querySelector<HTMLElement>('a[data-active]');
      const rootRect = root?.getBoundingClientRect();
      const rect = active?.getBoundingClientRect();
      const next =
        rect && rootRect && rect.height > 0
          ? {top: rect.top - rootRect.top + (root?.scrollTop ?? 0), height: rect.height}
          : null;
      setEntry((current) =>
        current?.top === next?.top && current?.height === next?.height ? current : next,
      );
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  });

  const variables = entry
    ? ({
        '--active-entry-top': `${entry.top}px`,
        '--active-entry-height': `${entry.height}px`,
      } as CSSProperties)
    : undefined;

  return useRender({
    defaultTagName: 'span',
    render,
    ref: ref ? [ref, elementRef] : elementRef,
    props: mergeProps<'span'>(
      {role: 'presentation', hidden: !entry, className: styles.indicator, style: variables},
      props,
    ),
  });
}

export interface TableOfContentsListProps extends HTMLAttributes<HTMLOListElement> {
  readonly ref?: Ref<HTMLOListElement> | undefined;
}

/** The ordered list of entries, at the top and nested inside an `Item` after its `Link`. */
export function TableOfContentsList({ref, className, ...props}: TableOfContentsListProps) {
  return <ol {...props} ref={ref} className={classes(styles.list, className)} />;
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
