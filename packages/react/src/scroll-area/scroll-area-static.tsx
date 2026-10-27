import type {HTMLAttributes, Ref} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './scroll-area.module.css';

export interface ScrollAreaStaticPartProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

/**
 * A scroll area for pages without React in the browser; `createScrollArea` makes it work. Vertical
 * scrolling only.
 */
export function ScrollAreaStaticRoot({ref, className, style, ...props}: ScrollAreaStaticPartProps) {
  return (
    <div
      role="presentation"
      {...props}
      ref={ref}
      className={classes(styles.root, className)}
      style={{position: 'relative', ...style}}
      data-elanor="scroll-area"
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

export function ScrollAreaStaticScrollbar({
  ref,
  className,
  style,
  ...props
}: ScrollAreaStaticPartProps) {
  return (
    <div
      aria-hidden="true"
      {...props}
      ref={ref}
      data-orientation="vertical"
      className={classes(styles.scrollbar, className)}
      // Hidden until the behavior finds overflowing content.
      style={{
        display: 'none',
        position: 'absolute',
        touchAction: 'none',
        userSelect: 'none',
        top: 0,
        bottom: 0,
        insetInlineEnd: 0,
        ...style,
      }}
    />
  );
}

export function ScrollAreaStaticThumb({
  ref,
  className,
  style,
  ...props
}: ScrollAreaStaticPartProps) {
  return (
    <div
      {...props}
      ref={ref}
      data-orientation="vertical"
      className={classes(styles.thumb, className)}
      style={{height: 'var(--scroll-area-thumb-height)', ...style}}
    />
  );
}
