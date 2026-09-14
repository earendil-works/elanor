import {Field as BaseField} from '@base-ui/react/field';
import {forwardRef, type ReactNode} from 'react';
import {Field} from '../field/field.tsx';

export interface ControlAndLabelProps extends Omit<BaseField.Root.Props, 'children'> {
  readonly label: ReactNode;
  readonly children: ReactNode;
  readonly description?: ReactNode;
  readonly error?: ReactNode;
}

export const ControlAndLabel = forwardRef<HTMLDivElement, ControlAndLabelProps>(
  function ControlAndLabel({label, children, description, error, className, ...props}, ref) {
    return (
      <Field.Root
        {...props}
        ref={ref}
        className={className}
      >
        <Field.Label>{label}</Field.Label>
        {children}
        {description ? (
          <Field.Description>{description}</Field.Description>
        ) : null}
        <Field.Error>{error}</Field.Error>
      </Field.Root>
    );
  },
);
