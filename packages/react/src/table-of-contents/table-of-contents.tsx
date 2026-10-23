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
      // Explicit, so the accessibility lint sees a link rather than a static element with a click
      // handler.
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
 * The element the bar sticks within: its nearest ancestor that clips or scrolls its overflow,
 * like `position: sticky` uses, or `null` for the document.
 */
function getScrollContainer(element: HTMLElement): HTMLElement | null {
  for (let node = element.parentElement; node; node = node.parentElement) {
    if (node === document.body || node === document.documentElement) return null;
    if (/auto|scroll|overlay|hidden/.test(getComputedStyle(node).overflowY)) return node;
  }
  return null;
}

/** Scrolling position of a scroll container, or of the document for `null`. */
function scrollTopOf(container: HTMLElement | null): number {
  return container ? container.scrollTop : scrollY;
}

export function TableOfContentsMenu({ref, render, children, ...props}: TableOfContentsMenuProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<BasePopover.Root.Actions>(null);
  const [open, setOpen] = useState(false);

  const close = useCallback(() => actionsRef.current?.close(), []);

  // Close the list when the bar's scroll container scrolls, so it never covers what the reader
  // scrolls to. The list's own scrolling doesn't count.
  useEffect(() => {
    const bar = barRef.current;
    if (!open || !bar) return undefined;
    const target = getScrollContainer(bar) ?? window;
    target.addEventListener('scroll', close, {passive: true});
    return () => target.removeEventListener('scroll', close);
  }, [open, close]);

  // Fade the shadow in as content scrolls beneath the bar: 0 at its resting position, 1 once
  // content has scrolled the fade distance beneath it.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return undefined;
    const container = getScrollContainer(bar);
    const target = container ?? window;
    let restingTop = 0;
    let stickyTop = 0;
    let frame = 0;
    function update(): void {
      frame = 0;
      const progress = (scrollTopOf(container) + stickyTop - restingTop) / SHADOW_FADE_DISTANCE;
      bar?.style.setProperty('--sticky-progress', String(Math.min(Math.max(progress, 0), 1)));
    }
    // The resting position, in the container's scrolling coordinates, changes only with the
    // layout; measure it with sticking turned off, then restore any inline position.
    function measure(): void {
      if (!bar) return;
      const position = bar.style.position;
      bar.style.position = 'static';
      const containerTop = container
        ? container.getBoundingClientRect().top + container.clientTop
        : 0;
      restingTop = bar.getBoundingClientRect().top - containerTop + scrollTopOf(container);
      bar.style.position = position;
      stickyTop = Number.parseFloat(getComputedStyle(bar).insetBlockStart) || 0;
      update();
    }
    function scheduleUpdate(): void {
      if (!frame) frame = requestAnimationFrame(update);
    }
    // Re-measure when the content around the bar changes size: the document's body, or the
    // container and what it holds, since a scroller keeps its own size as its content grows,
    // including children added later.
    const observer = new ResizeObserver(measure);
    const children = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) if (node instanceof Element) observer.observe(node);
      }
      measure();
    });
    if (container) {
      for (const element of [container, ...container.children]) observer.observe(element);
      children.observe(container, {childList: true});
    } else {
      observer.observe(document.body);
    }
    target.addEventListener('scroll', scheduleUpdate, {passive: true});
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      children.disconnect();
      target.removeEventListener('scroll', scheduleUpdate);
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
  /** Accessible name of the popup and the list's `nav`. */
  readonly label?: string;
}

/**
 * Moves focus into the opened list like Base UI does by default: to the first link, or to the
 * popup itself when opened by touch. It focuses without scrolling, though: while the popup scales
 * in, its first link can sit under the page's `scroll-padding`, and scrolling to it would close
 * the menu again.
 */
function focusOpenedMenu(popup: HTMLElement | null, interactionType: string): boolean {
  if (!popup) return true;
  const target =
    interactionType === 'touch' ? popup : (popup.querySelector<HTMLElement>('a[href]') ?? popup);
  target.focus({preventScroll: true});
  return false;
}

/** The sections, in a `nav` under the trigger. Put a `List` of `Item`s inside. */
export function TableOfContentsMenuPopup({
  ref,
  label = 'Table of contents',
  children,
  className,
  ...props
}: TableOfContentsMenuPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const initialFocus = useCallback(
    (interactionType: string) => focusOpenedMenu(popupRef.current, interactionType),
    [],
  );
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner align="start" className={styles.menuPositioner}>
        <BasePopover.Popup
          ref={popupRef}
          aria-label={label}
          className={styles.menuPopup}
          initialFocus={initialFocus}
        >
          <nav {...props} ref={ref} aria-label={label} className={className}>
            {children}
          </nav>
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}
