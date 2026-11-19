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
   * `always` shows the scrollbar whenever content overflows. `scrolling`, for a large area that is
   * read more than scrolled such as a conversation, shows it only while the reader scrolls (wheel,
   * touch, scroll keys) or points at it, then fades it out. Scrolling from code, typing in a field
   * and resizes don't show it. Forced colors always show it. React parts only.
   */
  readonly visibility?: ScrollAreaScrollbarVisibility;
}
export type ScrollAreaThumbProps = BaseScrollArea.Thumb.Props;

interface ViewportContextValue {
  readonly viewport: HTMLDivElement | null;
  readonly setViewport: (viewport: HTMLDivElement | null) => void;
}

/** Base UI's viewport ref is private. State, not a ref: the Scrollbar may mount first. */
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

/** Base UI's `data-scrolling` timeout. */
const HIDE_AFTER = 500;
/** The browser may animate a wheel or key scroll: scrolls this soon after (ms) are the reader's. */
const WHEEL_INTENT = 250;
const KEY_INTENT = 500;
/** Momentum after a finger lifts (ms). A fixed deadline, so scrolls from code can't extend it. */
const MOMENTUM = 1500;
const SCROLL_KEYS = /^(?:Arrow(?:Up|Down|Left|Right)|Page(?:Up|Down)|Home|End| )$/;

/** Typing scrolls a field to its caret; that isn't the reader scrolling. */
function isEditable(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || target.matches('input, textarea, select'))
  );
}

/**
 * Base UI's `data-scrolling` also marks scrolls from code within 100ms of any keydown, pointer
 * move or wheel (each further scroll restarts that window), and every scroll in touch mode.
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

/** Renders `data-visibility`, and `data-reader-scrolling` while the reader scrolls. */
export function ScrollAreaScrollbar({
  ref,
  visibility = 'always',
  className,
  ...props
}: ScrollAreaScrollbarProps) {
  const {viewport} = useViewportContext();
  const vertical = props.orientation !== 'horizontal';
  // A ref callback, not an effect: Base UI mounts the element only once content overflows.
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
