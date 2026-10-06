import {Switch as BaseSwitch} from '@base-ui/react/switch';
import {forwardRef} from 'react';
import styles from './switch.module.css';
import mark from '../utils/mark.module.css';
import outline from '../utils/outline.module.css';
import {classes, mergeClassName} from '../utils/class-names.ts';

export type {
  SwitchRootState,
  SwitchRootChangeEventReason,
  SwitchRootChangeEventDetails,
  SwitchThumbState,
} from '@base-ui/react/switch';

export type SwitchRootProps = BaseSwitch.Root.Props;
export type SwitchThumbProps = BaseSwitch.Thumb.Props;

export const SwitchRoot = forwardRef<HTMLElement, SwitchRootProps>(
  function SwitchRoot({className, children, ...props}, ref) {
    return (
      <BaseSwitch.Root
        {...props}
        ref={ref}
        className={mergeClassName<BaseSwitch.Root.State>(styles.root, className)}
      >
        {/* The visible control is smaller than the target, and carries the outline. */}
        <span className={classes(styles.track, outline.outline)} data-outline="pill-x-small" aria-hidden="true" />
        {children}
      </BaseSwitch.Root>
    );
  },
);

export const SwitchThumb = forwardRef<HTMLSpanElement, SwitchThumbProps>(
  function SwitchThumb({className, ...props}, ref) {
    return (
      <BaseSwitch.Thumb
        {...props}
        ref={ref}
        className={mergeClassName<BaseSwitch.Thumb.State>(classes(styles.thumb, mark.dot), className)}
      />
    );
  },
);

export const Switch = {
  Root: SwitchRoot,
  Thumb: SwitchThumb,
} as const;
