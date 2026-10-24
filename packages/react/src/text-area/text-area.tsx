import {Field as BaseField} from '@base-ui/react/field';
import type {ComponentPropsWithRef} from 'react';

import {classes, mergeClassName} from '../utils/class-names.ts';

import styles from './text-area.module.css';

export interface TextAreaProps extends Omit<
  ComponentPropsWithRef<'textarea'>,
  'className' | 'style'
> {
  readonly className?: BaseField.Control.Props['className'];
  readonly style?: BaseField.Control.Props['style'];
  /** Called with the new value on each change. */
  readonly onValueChange?: BaseField.Control.Props['onValueChange'];
  /** Uses the code typeface, for input such as JSON or configuration. */
  readonly monospace?: boolean;
}

export function TextArea({
  ref,
  className,
  style,
  value,
  defaultValue,
  onValueChange,
  monospace = false,
  id,
  name,
  disabled,
  autoFocus,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...props
}: TextAreaProps) {
  return (
    <BaseField.Control
      id={id}
      name={name}
      disabled={disabled}
      autoFocus={autoFocus}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      style={style}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid}
      // Compose the native element through Base UI's render API: textarea events
      // and its ref stay typed against the actual element, while Field owns value state.
      render={<textarea {...props} ref={ref} />}
      className={mergeClassName<BaseField.Control.State>(
        classes(styles.textarea, monospace && styles.monospace),
        className,
      )}
    />
  );
}
