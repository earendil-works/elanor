import {mergeProps} from '@base-ui/react/merge-props';
import {useRender} from '@base-ui/react/use-render';
import {Children, isValidElement, type ReactNode} from 'react';

import styles from './skeleton.module.css';

export type SkeletonState = {
  readonly loading: boolean;
  /** The children are only strings or numbers, so the placeholder covers each line of the text instead of the element. */
  readonly text: boolean;
};

export interface SkeletonProps extends useRender.ComponentProps<'span', SkeletonState> {
  /** Covers the content with a placeholder of the same size. */
  readonly loading?: boolean;
}

const placeholderProps = {'aria-hidden': true, inert: true};

/** Covers content that is still loading with a placeholder of its size. Renders a `span` by default. */
export function Skeleton({ref, render, loading = true, children, ...props}: SkeletonProps) {
  const text = isText(children);
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    state: {loading, text},
    props: mergeProps<'span'>(
      {
        className: styles.skeleton,
        children: loading && text ? <span className={styles.fill}>{children}</span> : children,
      },
      loading ? placeholderProps : undefined,
      props,
    ),
  });
}

/** No elements (`Children.toArray` drops `null` and booleans): strings and numbers, in practice. Any element, even a fragment, keeps the box look. */
function isText(children: ReactNode): boolean {
  const nodes = Children.toArray(children);
  return nodes.length > 0 && nodes.every((node) => !isValidElement(node));
}

export interface SkeletonTextProps extends Omit<useRender.ComponentProps<'span'>, 'children'> {
  /** Number of placeholder lines. */
  readonly lines?: number;
}

/** Placeholder lines in the size of the surrounding text, each a bar as tall as its capitals. Renders a `span` by default. */
export function SkeletonText({ref, render, lines = 1, ...props}: SkeletonTextProps) {
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: mergeProps<'span'>(
      {
        ...placeholderProps,
        className: styles.text,
        children: Array.from({length: lines}, (_, line) => (
          <span key={line} className={styles.line}>
            <span className={styles.bar} />
          </span>
        )),
      },
      props,
    ),
  });
}
