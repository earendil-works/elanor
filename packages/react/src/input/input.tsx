import {Input as BaseInput} from '@base-ui/react/input';
import {forwardRef} from 'react';
import styles from './input.module.css';
import {classes, mergeClassName} from '../utils/class-names.ts';

export type {
  InputState,
  InputChangeEventReason,
  InputChangeEventDetails,
} from '@base-ui/react/input';

const inputTypes = ['text', 'email', 'password', 'tel', 'url'] as const;

export type InputType = (typeof inputTypes)[number];

export interface InputProps extends Omit<BaseInput.Props, 'type'> {
  readonly type?: InputType;
  /** Class for the frame around the input, e.g. for sizing it in a flex or grid parent. */
  readonly rootClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {className, rootClassName, type = 'text', ...props},
  ref,
) {
  if (!inputTypes.includes(type)) {
    throw new TypeError(`Input does not support type="${type}". Use one of: ${inputTypes.join(', ')}.`);
  }

  // The frame draws the field: native inputs can't host the stroke layer.
  return (
    <span className={classes(styles.frame, rootClassName)} data-stroke="box-small">
      <BaseInput
        {...props}
        ref={ref}
        type={type}
        className={mergeClassName<BaseInput.State>(styles.control, className)}
      />
    </span>
  );
});
