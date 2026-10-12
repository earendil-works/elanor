import {Radio as BaseRadio, type RadioRootProps} from '@base-ui/react/radio';
import {RadioGroup as BaseRadioGroup} from '@base-ui/react/radio-group';
import {forwardRef, type Ref} from 'react';
import styles from './radio.module.css';
import mark from '../utils/mark.module.css';
import {useIndicatorClassName, useSurfaceClassName} from '../appearance/appearance.tsx';
import {classes, mergeClassName} from '../utils/class-names.ts';

export type {
  RadioRootState,
  RadioRootProps,
  RadioIndicatorState,
} from '@base-ui/react/radio';

export type {
  RadioGroupState,
  RadioGroupProps,
  RadioGroupChangeEventReason,
  RadioGroupChangeEventDetails,
} from '@base-ui/react/radio-group';

export type RadioIndicatorProps = BaseRadio.Indicator.Props;

export const RadioRoot = forwardRef(function RadioRoot<Value>(
  {className, children, ...props}: RadioRootProps<Value>,
  ref: Ref<HTMLSpanElement>,
): React.JSX.Element {
  const surfaceClassName = useSurfaceClassName();
  return (
    <BaseRadio.Root<Value>
      {...props}
      ref={ref}
      className={mergeClassName<BaseRadio.Root.State>(styles.radio, className)}
    >
      {/* The visible circle is smaller than the target. */}
      <span className={classes(styles.circle, surfaceClassName)} data-outline="circle-x-small" data-outline-focus="parent" aria-hidden="true" />
      {children}
    </BaseRadio.Root>
  );
}) as typeof BaseRadio.Root;

export const RadioIndicator = forwardRef<HTMLSpanElement, RadioIndicatorProps>(
  function RadioIndicator({className, ...props}, ref) {
    const indicatorClassName = useIndicatorClassName();
    // Custom children or render own the glyph; className/style/ref still customize the default glyph.
    const isMark = (props.children === undefined || props.children === null) && props.render === undefined;
    return (
      <BaseRadio.Indicator
        data-indicator={isMark ? 'dot' : undefined}
        {...props}
        ref={ref}
        className={mergeClassName<BaseRadio.Indicator.State>(classes(styles.indicator, isMark && mark.dot, isMark && indicatorClassName), className)}
      />
    );
  },
);

export const Radio = {
  Group: BaseRadioGroup,
  Root: RadioRoot,
  Indicator: RadioIndicator,
} as const;
