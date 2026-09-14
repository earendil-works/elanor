import {Input as BaseInput} from '@base-ui/react/input';
import {forwardRef} from 'react';
import styles from './input.module.css';
import {mergeClassName} from '../utils/class-names.ts';

export type {
  InputState,
  InputChangeEventReason,
  InputChangeEventDetails,
} from '@base-ui/react/input';

export interface InputProps extends BaseInput.Props {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {className, ...props},
  ref,
) {
  return (
    <BaseInput
      {...props}
      ref={ref}
      className={mergeClassName<BaseInput.State>(styles.control, className)}
    />
  );
});
