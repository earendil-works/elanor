import {ScrollArea as BaseScrollArea} from '@base-ui/react/scroll-area';

import {mergeClassName} from '../utils/class-names.ts';

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
export type ScrollAreaScrollbarProps = BaseScrollArea.Scrollbar.Props;
export type ScrollAreaThumbProps = BaseScrollArea.Thumb.Props;

export function ScrollAreaRoot({ref, className, ...props}: ScrollAreaRootProps) {
  return (
    <BaseScrollArea.Root
      {...props}
      ref={ref}
      className={mergeClassName<BaseScrollArea.Root.State>(styles.root, className)}
    />
  );
}

export function ScrollAreaViewport({ref, className, ...props}: ScrollAreaViewportProps) {
  return (
    <BaseScrollArea.Viewport
      {...props}
      ref={ref}
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

export function ScrollAreaScrollbar({ref, className, ...props}: ScrollAreaScrollbarProps) {
  return (
    <BaseScrollArea.Scrollbar
      {...props}
      ref={ref}
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
