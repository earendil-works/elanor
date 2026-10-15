import {mergeProps} from '@base-ui/react/merge-props';
import {useRender} from '@base-ui/react/use-render';
import type {LiHTMLAttributes, Ref} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './list.module.css';

export interface ListRootProps extends useRender.ComponentProps<'ul'> {}

/** A bulleted list of items. Renders `ul` by default; use `render={<ol />}` for a numbered list. */
export function ListRoot({ref, render, ...props}: ListRootProps) {
  return useRender({
    defaultTagName: 'ul',
    render,
    ref,
    props: mergeProps<'ul'>({className: styles.root}, props),
  });
}

export interface ListItemProps extends LiHTMLAttributes<HTMLLIElement> {
  readonly ref?: Ref<HTMLLIElement> | undefined;
}

/** One item of a list. Nest a `List.Root` inside for a sublist. */
export function ListItem({ref, className, ...props}: ListItemProps) {
  return <li {...props} ref={ref} className={classes(styles.item, className)} />;
}
