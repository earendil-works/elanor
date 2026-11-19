import {ScrollArea as BaseScrollArea} from '@base-ui/react/scroll-area';
import {createContext, use, useCallback, useMemo, useState} from 'react';

import {mergeClassName} from '../utils/class-names.ts';
import {useMergedRef} from '../utils/refs.ts';

import styles from './scroll-area.module.css';

export type {
  ScrollAreaRootState,
  ScrollAreaViewportState,
  ScrollAreaContentState,
  ScrollAreaScrollbarState,
  ScrollAreaThumbState,
  ScrollAreaCornerProps,
} from '@base-ui/react/scroll-area';

export type ScrollAreaRootProps = BaseScrollArea.Root.Props;
export type ScrollAreaViewportProps = BaseScrollArea.Viewport.Props;
export type ScrollAreaContentProps = BaseScrollArea.Content.Props;
export type ScrollAreaScrollbarVisibility = 'always' | 'scrolling';

export interface ScrollAreaScrollbarProps extends BaseScrollArea.Scrollbar.Props {
  /**
   * `always` shows the scrollbar whenever the content overflows, which says there is more, as in a
   * short list. `scrolling` shows it only while the reader scrolls the area (wheel, touch and its
   * momentum, scroll keys) or the pointer is on it, then fades it out: for a large area that is read
   * more than scrolled, such as a conversation. Scrolling the reader didn't do (scroll calls, content
   * arriving, a resize) doesn't show it. It keeps its place while hidden, so the pointer finds it, and
   * stays visible in forced colors.
   */
  readonly visibility?: ScrollAreaScrollbarVisibility;
}
export type ScrollAreaThumbProps = BaseScrollArea.Thumb.Props;

interface ViewportContextValue {
  readonly viewport: HTMLDivElement | null;
  readonly setViewport: (viewport: HTMLDivElement | null) => void;
}

/**
 * The Root's viewport element, for a Scrollbar to watch the reader's scrolling; Base UI keeps its own
 * private. State, not a ref, so the Scrollbar starts watching whichever part mounts first.
 */
const ViewportContext = /* @__PURE__ */ createContext<ViewportContextValue | null>(null);

function useViewportContext(): ViewportContextValue {
  const value = use(ViewportContext);
  if (value === null) throw new Error('ScrollArea parts must be inside ScrollArea.Root.');
  return value;
}

export function ScrollAreaRoot({ref, className, ...props}: ScrollAreaRootProps) {
  const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
  const value = useMemo(() => ({viewport, setViewport}), [viewport]);
  return (
    <ViewportContext value={value}>
      <BaseScrollArea.Root
        {...props}
        ref={ref}
        className={mergeClassName<BaseScrollArea.Root.State>(styles.root, className)}
      />
    </ViewportContext>
  );
}

export function ScrollAreaViewport({ref, className, ...props}: ScrollAreaViewportProps) {
  const {setViewport} = useViewportContext();
  const mergedRef = useMergedRef(ref, setViewport);
  return (
    <BaseScrollArea.Viewport
      {...props}
      ref={mergedRef}
      className={mergeClassName<BaseScrollArea.Viewport.State>(styles.viewport, className)}
    />
  );
}

export function ScrollAreaContent({ref, className, ...props}: ScrollAreaContentProps) {
  return (
    <BaseScrollArea.Content
      {...props}
      ref={ref}
      className={mergeClassName<BaseScrollArea.Content.State>(styles.content, className)}
    />
  );
}

/** How long (ms) the scrollbar stays after the reader's last scroll, as Base UI's `data-scrolling`. */
const HIDE_AFTER = 500;
/** How long (ms) scrolls after a wheel turn or a key count as the reader's; the browser may animate them. */
const WHEEL_INTENT = 250;
const KEY_INTENT = 500;
/** How long (ms) after a finger lifts its momentum may scroll. Fixed, so scrolls from code can't extend it. */
const MOMENTUM = 1500;
const SCROLL_KEYS = /^(?:Arrow(?:Up|Down|Left|Right)|Page(?:Up|Down)|Home|End| )$/;

/** Typing in a field scrolls to its caret, which isn't the reader scrolling. */
function isEditable(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || target.matches('input, textarea, select'))
  );
}

/**
 * Sets `data-reader-scrolling` on `scrollbar` while the reader scrolls `viewport` along its axis: the
 * wheel, the scroll keys, or a finger and its momentum. Base UI's `data-scrolling` also marks scrolls
 * from code within 100ms of any keydown, pointer movement or wheel (each further scroll restarts that
 * window), and every scroll in touch mode. Returns what stops watching.
 */
function watchReaderScrolling(
  scrollbar: HTMLElement,
  viewport: HTMLElement,
  vertical: boolean,
): () => void {
  const position = () => (vertical ? viewport.scrollTop : viewport.scrollLeft);
  let last = position();
  let intentUntil = 0;
  let touching = false;
  let hideTimer: ReturnType<typeof setTimeout> | undefined;
  const intend = (ms: number) => {
    intentUntil = Math.max(intentUntil, performance.now() + ms);
  };
  const onScroll = () => {
    const now = position();
    if (now === last) return;
    last = now;
    if (!touching && performance.now() >= intentUntil) return;
    scrollbar.toggleAttribute('data-reader-scrolling', true);
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => scrollbar.removeAttribute('data-reader-scrolling'), HIDE_AFTER);
  };
  const onWheel = () => intend(WHEEL_INTENT);
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || isEditable(event.target) || !SCROLL_KEYS.test(event.key)) return;
    intend(KEY_INTENT);
  };
  const onTouchStart = () => {
    touching = true;
  };
  const onTouchEnd = (event: TouchEvent) => {
    if (event.touches.length > 0) return;
    touching = false;
    intend(MOMENTUM);
  };
  const passive = {passive: true} as const;
  viewport.addEventListener('scroll', onScroll, passive);
  viewport.addEventListener('wheel', onWheel, passive);
  viewport.addEventListener('keydown', onKeyDown);
  viewport.addEventListener('touchstart', onTouchStart, passive);
  viewport.addEventListener('touchend', onTouchEnd, passive);
  viewport.addEventListener('touchcancel', onTouchEnd, passive);
  return () => {
    viewport.removeEventListener('scroll', onScroll);
    viewport.removeEventListener('wheel', onWheel);
    viewport.removeEventListener('keydown', onKeyDown);
    viewport.removeEventListener('touchstart', onTouchStart);
    viewport.removeEventListener('touchend', onTouchEnd);
    viewport.removeEventListener('touchcancel', onTouchEnd);
    clearTimeout(hideTimer);
    scrollbar.removeAttribute('data-reader-scrolling');
  };
}

/**
 * Renders `data-visibility`, and with `visibility="scrolling"`, `data-reader-scrolling` while the
 * reader scrolls.
 */
export function ScrollAreaScrollbar({
  ref,
  visibility = 'always',
  className,
  ...props
}: ScrollAreaScrollbarProps) {
  const {viewport} = useViewportContext();
  const vertical = props.orientation !== 'horizontal';
  // A ref callback, not an effect: Base UI mounts the scrollbar's element only once content overflows.
  const watch = useCallback(
    (scrollbar: HTMLDivElement | null) => {
      if (visibility !== 'scrolling' || scrollbar === null || viewport === null) return;
      return watchReaderScrolling(scrollbar, viewport, vertical);
    },
    [visibility, viewport, vertical],
  );
  const mergedRef = useMergedRef(ref, watch);
  return (
    <BaseScrollArea.Scrollbar
      {...props}
      ref={mergedRef}
      data-visibility={visibility}
      className={mergeClassName<BaseScrollArea.Scrollbar.State>(styles.scrollbar, className)}
    />
  );
}

export function ScrollAreaThumb({ref, className, ...props}: ScrollAreaThumbProps) {
  return (
    <BaseScrollArea.Thumb
      {...props}
      ref={ref}
      className={mergeClassName<BaseScrollArea.Thumb.State>(styles.thumb, className)}
    />
  );
}
