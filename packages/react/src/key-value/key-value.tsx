import type {ComponentPropsWithoutRef, Ref} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './key-value.module.css';

export interface KeyValueInlineProps extends ComponentPropsWithoutRef<'dl'> {
  readonly ref?: Ref<HTMLDListElement> | undefined;
}
export interface KeyValueGridProps extends ComponentPropsWithoutRef<'dl'> {
  readonly ref?: Ref<HTMLDListElement> | undefined;
}
export interface KeyValueKeyProps extends ComponentPropsWithoutRef<'dt'> {
  readonly ref?: Ref<HTMLElement> | undefined;
}
export interface KeyValueValueProps extends ComponentPropsWithoutRef<'dd'> {
  readonly ref?: Ref<HTMLElement> | undefined;
}

export function KeyValueInline({ref, className, ...props}: KeyValueInlineProps) {
  return <dl {...props} ref={ref} className={classes(styles.inline, className)} />;
}

export function KeyValueGrid({ref, className, ...props}: KeyValueGridProps) {
  return <dl {...props} ref={ref} className={classes(styles.grid, className)} />;
}

export function KeyValueKey({ref, children, className, ...props}: KeyValueKeyProps) {
  return (
    <dt {...props} ref={ref} className={classes(styles.key, className)}>
      {children}:
    </dt>
  );
}

export function KeyValueValue({ref, className, ...props}: KeyValueValueProps) {
  return <dd {...props} ref={ref} className={classes(styles.value, className)} />;
}
