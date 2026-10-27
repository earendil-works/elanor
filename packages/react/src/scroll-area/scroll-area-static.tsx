import type {ScrollArea as BaseScrollArea} from '@base-ui/react/scroll-area';
import {createContext, useContext, type CSSProperties, type HTMLAttributes, type Ref} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './scroll-area.module.css';

export interface ScrollAreaStaticPartProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

export interface ScrollAreaStaticRootProps extends ScrollAreaStaticPartProps {
  /** The page's own behaviors for this element, attached after the component's. */
  readonly 'data-elanor'?: string;
}

/** A scroll area for pages without React in the browser; `createScrollArea` makes it work. */
export function ScrollAreaStaticRoot({
  'data-elanor': pageBehaviors,
  ref,
  className,
  style,
  ...props
}: ScrollAreaStaticRootProps) {
  return (
    <div
      role="presentation"
      {...props}
      ref={ref}
      className={classes(styles.root, className)}
      style={
        {
          position: 'relative',
          '--scroll-area-corner-height': '0px',
          '--scroll-area-corner-width': '0px',
          ...style,
        } as CSSProperties
      }
      data-elanor={pageBehaviors ? `scroll-area ${pageBehaviors}` : 'scroll-area'}
    />
  );
}

export function ScrollAreaStaticViewport({
  ref,
  className,
  style,
  ...props
}: ScrollAreaStaticPartProps) {
  return (
    <div
      {...props}
      ref={ref}
      className={classes(styles.viewport, className)}
      style={{overflow: 'auto', ...style}}
    />
  );
}

export function ScrollAreaStaticContent({
  ref,
  className,
  style,
  ...props
}: ScrollAreaStaticPartProps) {
  return (
    <div
      role="presentation"
      {...props}
      ref={ref}
      className={classes(styles.content, className)}
      style={{minWidth: 'fit-content', ...style}}
    />
  );
}

export interface ScrollAreaStaticScrollbarProps extends ScrollAreaStaticPartProps {
  readonly orientation?: BaseScrollArea.Scrollbar.Props['orientation'];
}

const OrientationContext = /* @__PURE__ */ createContext<'vertical' | 'horizontal'>('vertical');

export function ScrollAreaStaticScrollbar({
  ref,
  orientation = 'vertical',
  className,
  style,
  children,
  ...props
}: ScrollAreaStaticScrollbarProps) {
  const position =
    orientation === 'vertical'
      ? {top: 0, bottom: 'var(--scroll-area-corner-height)', insetInlineEnd: 0}
      : {insetInlineStart: 0, insetInlineEnd: 'var(--scroll-area-corner-width)', bottom: 0};
  return (
    <div
      aria-hidden="true"
      {...props}
      ref={ref}
      data-orientation={orientation}
      className={classes(styles.scrollbar, className)}
      // Hidden until the behavior finds overflowing content.
      style={{
        display: 'none',
        position: 'absolute',
        touchAction: 'none',
        userSelect: 'none',
        ...position,
        ...style,
      }}
    >
      <OrientationContext.Provider value={orientation}>{children}</OrientationContext.Provider>
    </div>
  );
}

export function ScrollAreaStaticThumb({
  ref,
  className,
  style,
  ...props
}: ScrollAreaStaticPartProps) {
  const orientation = useContext(OrientationContext);
  return (
    <div
      {...props}
      ref={ref}
      data-orientation={orientation}
      className={classes(styles.thumb, className)}
      style={
        orientation === 'vertical'
          ? {height: 'var(--scroll-area-thumb-height)', ...style}
          : {width: 'var(--scroll-area-thumb-width)', ...style}
      }
    />
  );
}

/** Where the two scrollbars meet, shown while both are. */
export function ScrollAreaStaticCorner({ref, style, ...props}: ScrollAreaStaticPartProps) {
  return (
    <div
      aria-hidden="true"
      {...props}
      ref={ref}
      data-elanor-scroll-area-corner=""
      style={{
        display: 'none',
        position: 'absolute',
        bottom: 0,
        insetInlineEnd: 0,
        width: 'var(--scroll-area-corner-width)',
        height: 'var(--scroll-area-corner-height)',
        ...style,
      }}
    />
  );
}
