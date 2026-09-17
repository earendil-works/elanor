import {Switch as BaseSwitch} from '@base-ui/react/switch';
import {forwardRef} from 'react';
import styles from './switch.module.css';
import {mergeClassName} from '../utils/class-names.ts';

export type {
  SwitchRootState,
  SwitchRootChangeEventReason,
  SwitchRootChangeEventDetails,
  SwitchThumbState,
} from '@base-ui/react/switch';

export type SwitchRootProps = BaseSwitch.Root.Props;
export type SwitchThumbProps = BaseSwitch.Thumb.Props;

export const SwitchRoot = forwardRef<HTMLElement, SwitchRootProps>(
  function SwitchRoot({className, ...props}, ref) {
    return (
      <BaseSwitch.Root
        {...props}
        ref={ref}
        className={mergeClassName<BaseSwitch.Root.State>(styles.root, className)}
      />
    );
  },
);

export const SwitchThumb = forwardRef<HTMLSpanElement, SwitchThumbProps>(
  function SwitchThumb({className, ...props}, ref) {
    return (
      <BaseSwitch.Thumb
        {...props}
        ref={ref}
        className={mergeClassName<BaseSwitch.Thumb.State>(styles.thumb, className)}
      />
    );
  },
);

export const Switch = {
  Root: SwitchRoot,
  Thumb: SwitchThumb,
} as const;
