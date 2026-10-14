import {Switch as BaseSwitch} from '@base-ui/react/switch';
import {forwardRef} from 'react';
import styles from './switch.module.css';
import mark from '../utils/mark.module.css';
import {useIndicatorClassName, useSurfaceClassName} from '../appearance/appearance.tsx';
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
    const surfaceClassName = useSurfaceClassName();
    return (
      <BaseSwitch.Root
        {...props}
        ref={ref}
        className={mergeClassName<BaseSwitch.Root.State>(styles.root, className)}
      >
        {/* The visible surface is smaller than the target. */}
        <span className={classes(styles.track, surfaceClassName)} data-outline="pill-x-small" data-outline-focus="parent" aria-hidden="true" />
        {children}
      </BaseSwitch.Root>
    );
  },
);

export const SwitchThumb = forwardRef<HTMLSpanElement, SwitchThumbProps>(
  function SwitchThumb({className, ...props}, ref) {
    const indicatorClassName = useIndicatorClassName();
    // Custom children or render own the glyph; className/style/ref still customize the default glyph.
    const isMark = (props.children === undefined || props.children === null) && props.render === undefined;
    return (
      <BaseSwitch.Thumb
        data-indicator={isMark ? 'dot' : undefined}
        {...props}
        ref={ref}
        className={mergeClassName<BaseSwitch.Thumb.State>(classes(styles.thumb, isMark && mark.dot, isMark && indicatorClassName), className)}
      />
    );
  },
);

export const Switch = {
  Root: SwitchRoot,
  Thumb: SwitchThumb,
} as const;
