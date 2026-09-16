import {Switch as BaseSwitch} from '@base-ui/react/switch';
import {forwardRef} from 'react';
import styles from './switch.module.css';
import {useBrushVariant} from '../brush-border/use-brush-variant.ts';
import {mergeClassName} from '../utils/class-names.ts';

export type {
  SwitchRootState,
  SwitchRootProps,
  SwitchRootChangeEventReason,
  SwitchRootChangeEventDetails,
  SwitchThumbProps,
  SwitchThumbState,
} from '@base-ui/react/switch';

export const SwitchRoot = forwardRef<HTMLElement, BaseSwitch.Root.Props>(
  function SwitchRoot({className, ...props}, ref) {
    return (
      <BaseSwitch.Root
        data-brush-variant={useBrushVariant()}
        {...props}
        ref={ref}
        className={mergeClassName<BaseSwitch.Root.State>(styles.root, className)}
      />
    );
  },
);

export const SwitchThumb = forwardRef<HTMLSpanElement, BaseSwitch.Thumb.Props>(
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
