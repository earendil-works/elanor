import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type Ref,
} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './table-of-contents.module.css';

export interface TableOfContentsRootProps extends HTMLAttributes<HTMLElement> {
  readonly ref?: Ref<HTMLElement> | undefined;
}

interface Indicator {
  readonly offset: number;
  readonly size: number;
}

/**
 * A `nav` named "Table of contents" with an ordered list of `Item`s. One indicator marks the
 * active entry and moves to the next one when `active` changes; before it has measured the
 * entries, such as in server-rendered HTML, the active entry draws its own bar.
 */
export function TableOfContents({ref, children, className, ...props}: TableOfContentsRootProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const [indicator, setIndicator] = useState<Indicator | null>(null);
  const [animated, setAnimated] = useState(false);

  // Measure the active entry after every render and when the list resizes.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;
    function measure(): void {
      const active = list?.querySelector<HTMLElement>('[data-active]');
      const next = active ? {offset: active.offsetTop, size: active.offsetHeight} : null;
      setIndicator((current) =>
        current?.offset === next?.offset && current?.size === next?.size ? current : next,
      );
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  });

  // The first position appears in place; later changes move.
  useEffect(() => {
    if (!indicator || animated) return undefined;
    const frame = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(frame);
  }, [indicator, animated]);

  return (
    <nav
      {...props}
      ref={ref}
      aria-label={props['aria-label'] ?? 'Table of contents'}
      data-indicator={indicator ? '' : undefined}
      className={classes(styles.root, className)}
    >
      <ol ref={listRef} className={styles.list}>
        {children}
      </ol>
      {indicator ? (
        <span
          aria-hidden="true"
          data-animated={animated ? '' : undefined}
          className={styles.indicator}
          style={{
            translate: `0 calc(${indicator.offset}px + var(--semantic-dimension-space-padding-x-small))`,
            blockSize: `calc(${indicator.size}px - 2 * var(--semantic-dimension-space-padding-x-small))`,
          }}
        />
      ) : null}
    </nav>
  );
}

export interface TableOfContentsListProps extends HTMLAttributes<HTMLOListElement> {
  readonly ref?: Ref<HTMLOListElement> | undefined;
}

/** Nested entries, inside an `Item` after its `Link`. */
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
