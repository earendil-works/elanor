import {mergeProps} from '@base-ui/react/merge-props';
import {Popover as BasePopover} from '@base-ui/react/popover';
import {useRender} from '@base-ui/react/use-render';
import {KeyboardArrowDownIcon} from '@earendil-works/elanor-icons-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';

import {classes, mergeClassName} from '../utils/class-names.ts';

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
  href,
  children,
  className,
  onClick,
  ...props
}: TableOfContentsLinkProps) {
  const closeMenu = useContext(MenuCloseContext);
  return (
    <a
      {...props}
      ref={ref}
      href={href}
      aria-current={active ? 'location' : props['aria-current']}
      data-active={active ? '' : undefined}
      className={classes(styles.link, className)}
      onClick={(event) => {
        onClick?.(event);
        // In a menu, choosing a link closes it.
        closeMenu?.();
      }}
    >
      <span className={styles.label}>{children}</span>
    </a>
  );
}

/** Closes the enclosing menu with Base UI's `close` action; absent outside a menu. */
const MenuCloseContext = /* @__PURE__ */ createContext<(() => void) | null>(null);

export interface TableOfContentsMenuProps extends useRender.ComponentProps<'div'> {}

/** How far content scrolls beneath the menu bar until its shadow is fully shown, in pixels. */
const SHADOW_FADE_DISTANCE = 32;

/**
 * The table of contents collapsed into a sticky bar with a dropdown, for layouts without room for
 * the full list. Put a `MenuTrigger` and a `MenuPopup` inside. The bar sticks to the top of its
 * scroll container; set `inset-block-start` in your CSS to stick below a header. Its shadow fades
 * in as content scrolls beneath it, and the list closes when the page scrolls.
 */
export function TableOfContentsMenu({ref, render, children, ...props}: TableOfContentsMenuProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<BasePopover.Root.Actions>(null);
  const [open, setOpen] = useState(false);

  const close = useCallback(() => actionsRef.current?.close(), []);

  // Close the list when the page scrolls, so it never covers what the reader scrolls to.
  useEffect(() => {
    if (!open) return undefined;
    addEventListener('scroll', close, {passive: true});
    return () => removeEventListener('scroll', close);
  }, [open, close]);

  // Fade the shadow in as content scrolls beneath the bar: 0 at its resting position, 1 once
  // content has scrolled the fade distance beneath it.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return undefined;
    let restingTop = 0;
    let stickyTop = 0;
    let frame = 0;
    function update(): void {
      frame = 0;
      const progress = (scrollY + stickyTop - restingTop) / SHADOW_FADE_DISTANCE;
      bar?.style.setProperty('--sticky-progress', String(Math.min(Math.max(progress, 0), 1)));
    }
    // The resting position changes only with the layout; measure it with sticking turned off.
    function measure(): void {
      if (!bar) return;
      bar.style.position = 'static';
      restingTop = bar.getBoundingClientRect().top + scrollY;
      bar.style.removeProperty('position');
      stickyTop = Number.parseFloat(getComputedStyle(bar).insetBlockStart) || 0;
      update();
    }
    function scheduleUpdate(): void {
      if (!frame) frame = requestAnimationFrame(update);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    addEventListener('scroll', scheduleUpdate, {passive: true});
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      removeEventListener('scroll', scheduleUpdate);
    };
  }, []);

  return useRender({
    defaultTagName: 'div',
    render,
    ref: ref ? [ref, barRef] : barRef,
    props: mergeProps<'div'>(
      {
        className: styles.menu,
        children: (
          <BasePopover.Root actionsRef={actionsRef} onOpenChange={setOpen}>
            <MenuCloseContext.Provider value={close}>{children}</MenuCloseContext.Provider>
          </BasePopover.Root>
        ),
      },
      props,
    ),
  });
}

export interface TableOfContentsMenuTriggerProps extends Omit<
  BasePopover.Trigger.Props,
  'children'
> {
  /** The current section, shown in the trigger. */
  readonly children?: ReactNode;
  /** Read before the current section by assistive technology. */
  readonly label?: string;
}

/** Shows the current section and opens the list. */
export function TableOfContentsMenuTrigger({
  ref,
  label = 'Table of contents',
  children,
  className,
  ...props
}: TableOfContentsMenuTriggerProps) {
  return (
    <BasePopover.Trigger
      {...props}
      ref={ref}
      className={mergeClassName<BasePopover.Trigger.State>(styles.menuTrigger, className)}
    >
      <span className={styles.visuallyHidden}>{label}: </span>
      <span className={styles.menuValue}>{children}</span>
      <span className={styles.menuIcon} aria-hidden="true">
        <KeyboardArrowDownIcon />
      </span>
    </BasePopover.Trigger>
  );
}

export interface TableOfContentsMenuPopupProps extends HTMLAttributes<HTMLElement> {
  readonly ref?: Ref<HTMLElement> | undefined;
  /** Accessible name of the list's `nav`. */
  readonly label?: string;
}

/** The sections, in a `nav` under the trigger. Put a `List` of `Item`s inside. */
export function TableOfContentsMenuPopup({
  ref,
  label = 'Table of contents',
  children,
  className,
  ...props
}: TableOfContentsMenuPopupProps) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner align="start" className={styles.menuPositioner}>
        <BasePopover.Popup className={styles.menuPopup}>
          <nav {...props} ref={ref} aria-label={label} className={className}>
            {children}
          </nav>
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}
