import {Field as BaseField} from '@base-ui/react/field';
import type {ReactNode} from 'react';

import * as Field from '../field/index.ts';

export interface ControlAndLabelProps extends Omit<BaseField.Root.Props, 'children'> {
  /** Visible label, associated with the control. */
  readonly label: ReactNode;
  /** The control, such as `Input` or `TextArea`. */
  readonly children: ReactNode;
  /** Help text below the control. */
  readonly description?: ReactNode;
  /** Message shown when the control fails native validation. */
  readonly error?: ReactNode;
}

export function ControlAndLabel({
  ref,
  label,
  children,
  description,
  error,
  className,
  ...props
}: ControlAndLabelProps) {
  return (
    <Field.Root {...props} ref={ref} className={className}>
      <Field.Label>{label}</Field.Label>
      {children}
      {description ? <Field.Description>{description}</Field.Description> : null}
      <Field.Error>{error}</Field.Error>
    </Field.Root>
  );
}
