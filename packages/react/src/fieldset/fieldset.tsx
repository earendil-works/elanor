import {Fieldset as BaseFieldset} from '@base-ui/react/fieldset';

import {mergeClassName} from '../utils/class-names.ts';

import styles from './fieldset.module.css';

export type {FieldsetRootState, FieldsetLegendState} from '@base-ui/react/fieldset';

export type FieldsetRootProps = BaseFieldset.Root.Props;
export type FieldsetLegendProps = BaseFieldset.Legend.Props;

export function FieldsetRoot({ref, className, ...props}: FieldsetRootProps) {
  return (
    <BaseFieldset.Root
      {...props}
      ref={ref}
      className={mergeClassName<BaseFieldset.Root.State>(styles.root, className)}
    />
  );
}

export function FieldsetLegend({ref, className, ...props}: FieldsetLegendProps) {
  return (
    <BaseFieldset.Legend
      {...props}
      ref={ref}
      className={mergeClassName<BaseFieldset.Legend.State>(styles.legend, className)}
    />
  );
}
