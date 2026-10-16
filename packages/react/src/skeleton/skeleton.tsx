import {mergeProps} from '@base-ui/react/merge-props';
import {useRender} from '@base-ui/react/use-render';

import styles from './skeleton.module.css';

export type SkeletonState = {
  readonly loading: boolean;
};

export interface SkeletonProps extends useRender.ComponentProps<'span', SkeletonState> {
  /** Covers the content with a placeholder of the same size. */
  readonly loading?: boolean;
}

const placeholderProps = {'aria-hidden': true, inert: true};

/** Covers content that is still loading with a placeholder of its size. Renders a `span` by default. */
export function Skeleton({ref, render, loading = true, ...props}: SkeletonProps) {
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    state: {loading},
    props: mergeProps<'span'>(
      {className: styles.skeleton},
      loading ? placeholderProps : undefined,
      props,
    ),
  });
}

export interface SkeletonTextProps extends Omit<useRender.ComponentProps<'span'>, 'children'> {
  /** Number of placeholder lines. */
  readonly lines?: number;
}

/** Placeholder lines in the size of the surrounding text. Renders a `span` by default. */
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
          <span key={line} className={styles.line} />
        )),
      },
      props,
    ),
  });
}
