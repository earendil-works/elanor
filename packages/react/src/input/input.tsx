import {Input as BaseInput} from '@base-ui/react/input';

import {mergeClassName} from '../utils/class-names.ts';

import styles from './input.module.css';

export type {
  InputState,
  InputChangeEventReason,
  InputChangeEventDetails,
} from '@base-ui/react/input';

const inputTypes = ['text', 'email', 'password', 'tel', 'url'] as const;

export type InputType = (typeof inputTypes)[number];

export interface InputProps extends Omit<BaseInput.Props, 'type'> {
  readonly type?: InputType;
}

export function Input({ref, className, type = 'text', ...props}: InputProps) {
  if (!inputTypes.includes(type)) {
    throw new TypeError(
      `Input does not support type="${type}". Use one of: ${inputTypes.join(', ')}.`,
    );
  }

  return (
    <BaseInput
      {...props}
      ref={ref}
      type={type}
      className={mergeClassName<BaseInput.State>(styles.control, className)}
    />
  );
}
