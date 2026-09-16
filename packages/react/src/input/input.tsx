import {Input as BaseInput} from '@base-ui/react/input';
import {forwardRef} from 'react';
import styles from './input.module.css';
import brushStyles from '../brush-border/brush-border.module.css';
import {useBrushVariant, type BrushProps} from '../brush-border/use-brush-variant.ts';
import {classes, mergeClassName} from '../utils/class-names.ts';

export type {
  InputState,
  InputChangeEventReason,
  InputChangeEventDetails,
} from '@base-ui/react/input';

export interface InputProps extends BaseInput.Props, BrushProps {
  /** Layout class for the decorative wrapper. className/style/ref stay on the input. */
  readonly rootClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {className, rootClassName, brushVariant, ...props},
  ref,
) {
  return (
    <span
      className={classes(brushStyles.fieldFrame, rootClassName)}
      data-brush-variant={useBrushVariant(brushVariant)}
    >
      <BaseInput
        {...props}
        ref={ref}
        className={mergeClassName<BaseInput.State>(styles.control, className)}
      />
    </span>
  );
});
