import {mergeProps} from '@base-ui/react/merge-props';
import {useRender} from '@base-ui/react/use-render';
import type {ReactNode} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './card.module.css';

export interface CardProps extends Omit<useRender.ComponentProps<'div'>, 'children'> {
  /** Names the metric, such as "Active projects". Ignored when `children` is set. */
  readonly label?: ReactNode;
  /** The metric, such as a count. Ignored when `children` is set. */
  readonly value?: ReactNode;
  /** Supporting text below the metric. Ignored when `children` is set. */
  readonly description?: ReactNode;
  /** Adds inner padding. Set `false` for edge-to-edge content. */
  readonly padded?: boolean;
  /** Custom content, replacing the metric layout. */
  readonly children?: ReactNode;
}

/**
 * A padded block for related content. Renders a `div` by default; render an `<a>` to make the whole
 * card a link, which gets hover and focus styles.
 */
export function Card({
  ref,
  render,
  label,
  value,
  description,
  padded = true,
  children,
  ...props
}: CardProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({className: classes(styles.root, padded && styles.padded)}, props, {
      children: children ?? (
        <>
          <div className={styles.content}>
            {label === undefined ? null : <div className={styles.label}>{label}</div>}
            {value === undefined ? null : <div className={styles.value}>{value}</div>}
          </div>
          {description === undefined ? null : (
            <div className={styles.description}>{description}</div>
          )}
        </>
      ),
    }),
  });
}
