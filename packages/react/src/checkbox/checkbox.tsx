import {Checkbox as BaseCheckbox} from '@base-ui/react/checkbox';
import {forwardRef} from 'react';
import styles from './checkbox.module.css';
import mark from '../utils/mark.module.css';
import {useIndicatorClassName, useSurfaceClassName} from '../appearance/appearance.tsx';
import {classes, mergeClassName} from '../utils/class-names.ts';

export type {
  CheckboxRootState,
  CheckboxRootChangeEventReason,
  CheckboxRootChangeEventDetails,
  CheckboxIndicatorState,
} from '@base-ui/react/checkbox';

export type CheckboxRootProps = BaseCheckbox.Root.Props;
export type CheckboxIndicatorProps = BaseCheckbox.Indicator.Props;

export const CheckboxRoot = forwardRef<HTMLElement, CheckboxRootProps>(
  function CheckboxRoot({className, children, ...props}, ref) {
    const surfaceClassName = useSurfaceClassName();
    return (
      <BaseCheckbox.Root
        {...props}
        ref={ref}
        className={mergeClassName<BaseCheckbox.Root.State>(styles.root, className)}
      >
        {/* The visible surface is smaller than the target. */}
        <span className={classes(styles.box, surfaceClassName)} data-outline="box-small" data-outline-focus="parent" aria-hidden="true" />
        {children}
      </BaseCheckbox.Root>
    );
  },
);

export const CheckboxIndicator = forwardRef<HTMLSpanElement, CheckboxIndicatorProps>(
  function CheckboxIndicator({className, children, ...props}, ref) {
    const indicatorSkinClassName = useIndicatorClassName();
    // Custom children or render own the glyph; className/style/ref still customize the default glyph.
    const isMark = (children === undefined || children === null) && props.render === undefined;
    const indicatorClassName = (state: BaseCheckbox.Indicator.State) =>
      classes(styles.indicator, isMark && styles.mark, isMark && (state.indeterminate ? mark.dash : mark.check), isMark && indicatorSkinClassName);
    return (
      <BaseCheckbox.Indicator
        data-indicator={isMark ? 'check' : undefined}
        {...props}
        ref={ref}
        className={mergeClassName<BaseCheckbox.Indicator.State>(indicatorClassName, className)}
      >
        {children}
      </BaseCheckbox.Indicator>
    );
  },
);

export const Checkbox = {
  Root: CheckboxRoot,
  Indicator: CheckboxIndicator,
} as const;
