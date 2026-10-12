import {Switch as BaseSwitch} from '@base-ui/react/switch';
import type {ComponentPropsWithRef} from 'react';

import {mergeClassName} from '../utils/class-names.ts';

import styles from './switch.module.css';

export type {
  SwitchRootState,
  SwitchRootChangeEventReason,
  SwitchRootChangeEventDetails,
  SwitchThumbState,
} from '@base-ui/react/switch';

export type SwitchRootProps = ComponentPropsWithRef<typeof BaseSwitch.Root>;
export type SwitchThumbProps = BaseSwitch.Thumb.Props;

export function SwitchRoot({ref, className, ...props}: SwitchRootProps) {
  return (
    <BaseSwitch.Root
      {...props}
      ref={ref}
      className={mergeClassName<BaseSwitch.Root.State>(styles.root, className)}
    />
  );
}

export function SwitchThumb({ref, className, ...props}: SwitchThumbProps) {
  return (
    <BaseSwitch.Thumb
      {...props}
      ref={ref}
      className={mergeClassName<BaseSwitch.Thumb.State>(styles.thumb, className)}
    />
  );
}

export const Switch = {
  Root: SwitchRoot,
  Thumb: SwitchThumb,
} as const;
