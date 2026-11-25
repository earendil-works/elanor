import type {ButtonState} from '@base-ui/react/button';
import {mergeProps} from '@base-ui/react/merge-props';
import {useRender} from '@base-ui/react/use-render';
import {CloseSmallIcon} from '@earendil-works/elanor-icons-react';
import {use, type ReactNode} from 'react';

import {IconButton, type IconButtonProps} from '../icon-button/icon-button.tsx';
import {mergeClassName} from '../utils/class-names.ts';
import {ChipHostContext} from './chip-host-context.ts';

import styles from './chip.module.css';

export type ChipVariant = 'outline' | 'soft';
export type ChipDensity = 'compact' | 'default';

export interface ChipRootProps extends useRender.ComponentProps<'span'> {
  /**
   * `outline`: a bordered box.
   * `soft`: a filled pill.
   */
  readonly variant?: ChipVariant | undefined;
  /**
   * `default`: 24px, for lists and attachments.
   * `compact`: no block padding and a smaller icon and Remove, to fit a line of text.
   */
  readonly density?: ChipDensity | undefined;
}

/**
 * A small box or pill for one item, such as a file, a quotation or a filter. Renders a `span`; use
 * `render` for an `li`. Stays on one line, at most as wide as its container. Renders
 * `data-variant` and `data-density`; in a composer's prompt also `data-hosted`, and
 * `data-selected`, outlined, while it is selected there.
 */
export function ChipRoot({
  ref,
  render,
  variant = 'outline',
  density = 'default',
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
      'data-hosted': host ? '' : undefined,
      'data-selected': host?.selected ? '' : undefined,
    },
  });
}

export interface ChipIconProps extends useRender.ComponentProps<'span'> {}

/** A decorative icon before the label, hidden from assistive technology. */
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
 * Text on one line, cut with an ellipsis. A label before another keeps its width, up to half the
 * chip. With `render={<q />}` the quotation marks stay and the ellipsis falls inside them.
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
