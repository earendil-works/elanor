import {forwardRef, type ComponentPropsWithoutRef} from 'react';
import styles from './key-value-grid.module.css';
import {classes} from '../utils/class-names.ts';

export interface KeyValueGridRootProps extends ComponentPropsWithoutRef<'dl'> {}
export interface KeyValueGridKeyProps extends ComponentPropsWithoutRef<'dt'> {}
export interface KeyValueGridValueProps extends ComponentPropsWithoutRef<'dd'> {}

export const KeyValueGridRoot = forwardRef<HTMLDListElement, KeyValueGridRootProps>(
  function KeyValueGridRoot({className, ...props}, ref) {
    return <dl {...props} ref={ref} className={classes(styles.root, className)} />;
  },
);

export const KeyValueGridKey = forwardRef<HTMLElement, KeyValueGridKeyProps>(
  function KeyValueGridKey({children, className, ...props}, ref) {
    return <dt {...props} ref={ref} className={classes(styles.key, className)}>{children}:</dt>;
  },
);

export const KeyValueGridValue = forwardRef<HTMLElement, KeyValueGridValueProps>(
  function KeyValueGridValue({className, ...props}, ref) {
    return <dd {...props} ref={ref} className={classes(styles.value, className)} />;
  },
);

export const KeyValueGrid = {
  Root: KeyValueGridRoot,
  Key: KeyValueGridKey,
  Value: KeyValueGridValue,
} as const;
