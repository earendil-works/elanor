import {Meter as BaseMeter} from '@base-ui/react/meter';
import type {ComponentPropsWithRef} from 'react';

import {mergeClassName} from '../utils/class-names.ts';

import styles from './meter.module.css';

export type MeterSemantic = 'neutral' | 'warning' | 'negative';

export interface MeterRootProps extends ComponentPropsWithRef<typeof BaseMeter.Root> {
  /** Indicator color. `warning` and `negative` flag a value near or past a limit. */
  readonly semantic?: MeterSemantic;
}
export type MeterLabelProps = ComponentPropsWithRef<typeof BaseMeter.Label>;
export type MeterTrackProps = ComponentPropsWithRef<typeof BaseMeter.Track>;
export type MeterIndicatorProps = ComponentPropsWithRef<typeof BaseMeter.Indicator>;
export type MeterValueProps = ComponentPropsWithRef<typeof BaseMeter.Value>;

export function MeterRoot({ref, semantic = 'neutral', className, ...props}: MeterRootProps) {
  return (
    <BaseMeter.Root
      {...props}
      ref={ref}
      data-semantic={semantic}
      className={mergeClassName<BaseMeter.Root.State>(styles.root, className)}
    />
  );
}

export function MeterLabel({ref, className, ...props}: MeterLabelProps) {
  return (
    <BaseMeter.Label
      {...props}
      ref={ref}
      className={mergeClassName<BaseMeter.Label.State>(styles.label, className)}
    />
  );
}

export function MeterTrack({ref, className, ...props}: MeterTrackProps) {
  return (
    <BaseMeter.Track
      {...props}
      ref={ref}
      className={mergeClassName<BaseMeter.Track.State>(styles.track, className)}
    />
  );
}

export function MeterIndicator({ref, className, ...props}: MeterIndicatorProps) {
  return (
    <BaseMeter.Indicator
      {...props}
      ref={ref}
      className={mergeClassName<BaseMeter.Indicator.State>(styles.indicator, className)}
    />
  );
}

export function MeterValue({ref, className, ...props}: MeterValueProps) {
  return (
    <BaseMeter.Value
      {...props}
      ref={ref}
      className={mergeClassName<BaseMeter.Value.State>(styles.value, className)}
    />
  );
}
