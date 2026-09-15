import {forwardRef, type ComponentPropsWithoutRef} from 'react';
import styles from './key-value.module.css';
import {classes} from '../utils/class-names.ts';

export interface KeyValueInlineProps extends ComponentPropsWithoutRef<'dl'> {}
export interface KeyValueGridProps extends ComponentPropsWithoutRef<'dl'> {}
export interface KeyValueKeyProps extends ComponentPropsWithoutRef<'dt'> {}
export interface KeyValueValueProps extends ComponentPropsWithoutRef<'dd'> {}

export const KeyValueInline = forwardRef<HTMLDListElement, KeyValueInlineProps>(
  function KeyValueInline({className, ...props}, ref) {
    return <dl {...props} ref={ref} className={classes(styles.inline, className)} />;
  },
);

export const KeyValueGrid = forwardRef<HTMLDListElement, KeyValueGridProps>(
  function KeyValueGrid({className, ...props}, ref) {
    return <dl {...props} ref={ref} className={classes(styles.grid, className)} />;
  },
);

export const KeyValueKey = forwardRef<HTMLElement, KeyValueKeyProps>(
  function KeyValueKey({children, className, ...props}, ref) {
    return <dt {...props} ref={ref} className={classes(styles.key, className)}>{children}:</dt>;
  },
);

export const KeyValueValue = forwardRef<HTMLElement, KeyValueValueProps>(
  function KeyValueValue({className, ...props}, ref) {
    return <dd {...props} ref={ref} className={classes(styles.value, className)} />;
  },
);

export const KeyValue = {
  Inline: KeyValueInline,
  Grid: KeyValueGrid,
  Key: KeyValueKey,
  Value: KeyValueValue,
} as const;
