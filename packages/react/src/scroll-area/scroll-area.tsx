import {ScrollArea as BaseScrollArea} from '@base-ui/react/scroll-area';
import {forwardRef} from 'react';

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

export const ScrollAreaRoot = forwardRef<HTMLDivElement, ScrollAreaRootProps>(
  function ScrollAreaRoot({className, ...props}, ref) {
    return (
      <BaseScrollArea.Root
        {...props}
        ref={ref}
        className={mergeClassName<BaseScrollArea.Root.State>(styles.root, className)}
      />
    );
  },
);

export const ScrollAreaViewport = forwardRef<HTMLDivElement, ScrollAreaViewportProps>(
  function ScrollAreaViewport({className, ...props}, ref) {
    return (
      <BaseScrollArea.Viewport
        {...props}
        ref={ref}
        className={mergeClassName<BaseScrollArea.Viewport.State>(styles.viewport, className)}
      />
    );
  },
);

export const ScrollAreaContent = forwardRef<HTMLDivElement, ScrollAreaContentProps>(
  function ScrollAreaContent({className, ...props}, ref) {
    return (
      <BaseScrollArea.Content
        {...props}
        ref={ref}
        className={mergeClassName<BaseScrollArea.Content.State>(styles.content, className)}
      />
    );
  },
);

export const ScrollAreaScrollbar = forwardRef<HTMLDivElement, ScrollAreaScrollbarProps>(
  function ScrollAreaScrollbar({className, ...props}, ref) {
    return (
      <BaseScrollArea.Scrollbar
        {...props}
        ref={ref}
        className={mergeClassName<BaseScrollArea.Scrollbar.State>(styles.scrollbar, className)}
      />
    );
  },
);

export const ScrollAreaThumb = forwardRef<HTMLDivElement, ScrollAreaThumbProps>(
  function ScrollAreaThumb({className, ...props}, ref) {
    return (
      <BaseScrollArea.Thumb
        {...props}
        ref={ref}
        className={mergeClassName<BaseScrollArea.Thumb.State>(styles.thumb, className)}
      />
    );
  },
);

export const ScrollArea = {
  Root: ScrollAreaRoot,
  Viewport: ScrollAreaViewport,
  Content: ScrollAreaContent,
  Scrollbar: ScrollAreaScrollbar,
  Thumb: ScrollAreaThumb,
  Corner: BaseScrollArea.Corner,
} as const;
