import type {ButtonState} from '@base-ui/react/button';
import {mergeProps} from '@base-ui/react/merge-props';
import {Progress as BaseProgress} from '@base-ui/react/progress';
import {useRender} from '@base-ui/react/use-render';
import {ChevronRightIcon, CloseSmallIcon} from '@earendil-works/elanor-icons-react';
import {use, type ComponentPropsWithRef, type ReactNode} from 'react';

import {IconButton, type IconButtonProps} from '../icon-button/icon-button.tsx';
import {mergeClassName} from '../utils/class-names.ts';
import {ChipHostContext} from './chip-host-context.ts';

import styles from './chip.module.css';

export type ChipVariant = 'outline' | 'soft';
export type ChipDensity = 'compact' | 'default';
export type ChipSemantic = 'neutral' | 'positive' | 'warning' | 'negative';

export interface ChipRootProps extends useRender.ComponentProps<'span'> {
  /**
   * `outline`: a bordered box on the canvas.
   * `soft`: a filled pill with a faint edge.
   */
  readonly variant?: ChipVariant | undefined;
  /**
   * `default`: 24px tall, for lists, such as a form's files or a set of filters.
   * `compact`: as tall as its text (20px) and centred in the line of the text around it, such
   * as 2px above and below in a 24px line, so it sits in a sentence.
   */
  readonly density?: ChipDensity | undefined;
  /**
   * The item's state: `negative` for one that failed, such as an upload, `warning` and
   * `positive` for others. Tints the fill of `soft` and the edge of `outline`; say the state in
   * words too, such as in a tooltip or a notice.
   */
  readonly semantic?: ChipSemantic | undefined;
}

/**
 * A small box or pill for one item, such as a file, a quotation or a filter. Renders a `span`; use
 * `render` for an `li`. Stays on one line, at most as wide as its container. Renders
 * `data-variant`, `data-density` and `data-semantic`; in a composer's prompt also
 * `data-selected`, in the information fill, while it is selected there.
 */
export function ChipRoot({
  ref,
  render,
  variant = 'outline',
  density = 'default',
  semantic = 'neutral',
  ...props
}: ChipRootProps) {
  const host = use(ChipHostContext);
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: {
      ...mergeProps<'span'>({className: styles.root}, props),
      'data-variant': variant,
      'data-density': density,
      'data-semantic': semantic,
      'data-selected': host?.selected ? '' : undefined,
    },
  });
}

export interface ChipIconProps extends useRender.ComponentProps<'span'> {}

/**
 * A decorative icon, 16px, hidden from assistive technology: what the item is, or where it is,
 * before its label. For the arrow between a place and a name, use `Chip.Separator`.
 */
export function ChipIcon({ref, render, ...props}: ChipIconProps) {
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: mergeProps<'span'>({className: styles.icon, 'aria-hidden': true}, props),
  });
}

export interface ChipLabelProps extends useRender.ComponentProps<'span'> {}

/**
 * Text on one line, cut with an ellipsis. A label before another is the place, such as "devbox":
 * in the secondary text color, it keeps its width, up to half the chip, and the last label, the
 * name, takes the ellipsis. With `render={<q />}` the quotation marks stay and the ellipsis falls
 * inside them.
 */
export function ChipLabel({ref, render, children, ...props}: ChipLabelProps) {
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: mergeProps<'span'>(
      {className: styles.label, children: <span className={styles.text}>{children}</span>},
      props,
    ),
  });
}

export interface ChipSeparatorProps extends useRender.ComponentProps<'span'> {
  /** The icon. Defaults to a chevron pointing to the name. */
  readonly children?: ReactNode;
}

/**
 * The arrow between a place's label and the item's name, as in "devbox › build.mjs". Points to
 * the name, mirrored in right-to-left text, and is hidden from assistive technology, which reads
 * the two labels in order.
 */
export function ChipSeparator({
  ref,
  render,
  children = <ChevronRightIcon />,
  ...props
}: ChipSeparatorProps) {
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: mergeProps<'span'>({className: styles.separator, 'aria-hidden': true, children}, props),
  });
}

export interface ChipProgressProps extends Omit<
  ComponentPropsWithRef<typeof BaseProgress.Root>,
  'children'
> {}

/**
 * A 2px bar at the chip's foot for an item on its way, such as a file uploading, filled to `value`
 * between `min` and `max` (0 and 100 by default), or pulsing while `value` is `null`. Name it
 * with `aria-label`, such as "Uploading crash.log". While it is in the chip, the name is in the
 * secondary text color; remove it when the item is done, or set `semantic="negative"` when it
 * failed. A [Base UI Progress](https://base-ui.com/react/components/progress) bar; renders a
 * `span` with `role="progressbar"`.
 */
export function ChipProgress({ref, render = <span />, className, ...props}: ChipProgressProps) {
  return (
    <BaseProgress.Root
      {...props}
      ref={ref}
      render={render}
      className={mergeClassName<BaseProgress.Root.State>(styles.progress, className)}
    >
      <BaseProgress.Track render={<span />} className={styles.track}>
        <BaseProgress.Indicator render={<span />} className={styles.indicator} />
      </BaseProgress.Track>
    </BaseProgress.Root>
  );
}

export interface ChipRemoveProps extends Omit<IconButtonProps, 'density' | 'hierarchy'> {
  /** The icon. Defaults to a cross. */
  readonly children?: ReactNode;
}

/**
 * An [Icon button](/components/icon-button/) that removes the chip. Give it an `aria-label` naming
 * the item, such as "Remove design.pdf", and remove the item in `onClick`. In a composer's prompt
 * it removes the chip from the text itself, and is for pointers only: hidden from assistive
 * technology and out of the Tab order, since Backspace and Delete remove a chip there. Renders
 * `data-chip-remove`.
 */
export function ChipRemove({
  ref,
  className,
  children = <CloseSmallIcon />,
  ...props
}: ChipRemoveProps) {
  const host = use(ChipHostContext);
  const {onPointerDown, onClick} = props;
  const hosted: Partial<IconButtonProps> | null = host && {
    'aria-hidden': true,
    tabIndex: -1,
    onPointerDown: (event) => {
      onPointerDown?.(event);
      // Keeps the focus and the caret in the text.
      event.preventDefault();
    },
    onClick: (event) => {
      onClick?.(event);
      if (!event.defaultPrevented) host.remove(event.nativeEvent);
    },
  };
  return (
    <IconButton
      {...props}
      {...hosted}
      ref={ref}
      data-chip-remove=""
      className={mergeClassName<ButtonState>(styles.remove, className)}
    >
      {children}
    </IconButton>
  );
}
