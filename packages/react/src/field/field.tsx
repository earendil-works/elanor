import {Field as BaseField} from '@base-ui/react/field';
import type {ComponentPropsWithRef} from 'react';

import {mergeClassName} from '../utils/class-names.ts';

import styles from './field.module.css';

export type {
  FieldValidityData,
  FieldRootActions,
  FieldRootState,
  FieldLabelState,
  FieldDescriptionState,
  FieldErrorState,
  FieldValidityState,
  FieldValidityProps,
  FieldItemState,
  FieldItemProps,
} from '@base-ui/react/field';

export type FieldRootProps = BaseField.Root.Props;
export type FieldLabelProps = ComponentPropsWithRef<typeof BaseField.Label>;
export type FieldDescriptionProps = BaseField.Description.Props;
export type FieldErrorProps = BaseField.Error.Props;

export function FieldRoot({ref, className, ...props}: FieldRootProps) {
  return (
    <BaseField.Root
      {...props}
      ref={ref}
      className={mergeClassName<BaseField.Root.State>(styles.root, className)}
    />
  );
}

export function FieldLabel({ref, className, ...props}: FieldLabelProps) {
  return (
    <BaseField.Label
      {...props}
      ref={ref}
      className={mergeClassName<BaseField.Label.State>(styles.label, className)}
    />
  );
}

export function FieldDescription({ref, className, ...props}: FieldDescriptionProps) {
  return (
    <BaseField.Description
      {...props}
      ref={ref}
      className={mergeClassName<BaseField.Description.State>(styles.description, className)}
    />
  );
}

export function FieldError({ref, className, ...props}: FieldErrorProps) {
  return (
    <BaseField.Error
      {...props}
      ref={ref}
      className={mergeClassName<BaseField.Error.State>(styles.error, className)}
    />
  );
}

export const Field = {
  Root: FieldRoot,
  Label: FieldLabel,
  Description: FieldDescription,
  Error: FieldError,
  Item: BaseField.Item,
  Validity: BaseField.Validity,
} as const;
