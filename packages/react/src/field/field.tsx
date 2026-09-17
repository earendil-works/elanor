import {Field as BaseField} from '@base-ui/react/field';
import {forwardRef} from 'react';
import styles from './field.module.css';
import {mergeClassName} from '../utils/class-names.ts';

export type {
  FieldValidityData,
  FieldRootActions,
  FieldRootState,
  FieldLabelState,
  FieldDescriptionState,
  FieldErrorState,
  FieldControlState,
  FieldControlChangeEventReason,
  FieldControlChangeEventDetails,
  FieldValidityState,
  FieldValidityProps,
  FieldItemState,
  FieldItemProps,
} from '@base-ui/react/field';

export type FieldRootProps = BaseField.Root.Props;
export type FieldLabelProps = BaseField.Label.Props;
export type FieldDescriptionProps = BaseField.Description.Props;
export type FieldErrorProps = BaseField.Error.Props;
export type FieldControlProps = BaseField.Control.Props;

export const FieldRoot = forwardRef<HTMLDivElement, FieldRootProps>(function FieldRoot(
  {className, ...props}, ref,
) {
  return <BaseField.Root {...props} ref={ref} className={mergeClassName<BaseField.Root.State>(styles.root, className)} />;
});

export const FieldLabel = forwardRef<HTMLElement, FieldLabelProps>(function FieldLabel(
  {className, ...props}, ref,
) {
  return <BaseField.Label {...props} ref={ref} className={mergeClassName<BaseField.Label.State>(styles.label, className)} />;
});

export const FieldDescription = forwardRef<HTMLParagraphElement, FieldDescriptionProps>(function FieldDescription(
  {className, ...props}, ref,
) {
  return <BaseField.Description {...props} ref={ref} className={mergeClassName<BaseField.Description.State>(styles.description, className)} />;
});

export const FieldError = forwardRef<HTMLDivElement, FieldErrorProps>(function FieldError(
  {className, ...props}, ref,
) {
  return <BaseField.Error {...props} ref={ref} className={mergeClassName<BaseField.Error.State>(styles.error, className)} />;
});

export const FieldControl = forwardRef<HTMLElement, FieldControlProps>(function FieldControl(
  {className, ...props}, ref,
) {
  return <BaseField.Control {...props} ref={ref} className={mergeClassName<BaseField.Control.State>(styles.control, className)} />;
});

export const Field = {
  Root: FieldRoot,
  Label: FieldLabel,
  Control: FieldControl,
  Description: FieldDescription,
  Error: FieldError,
  Item: BaseField.Item,
  Validity: BaseField.Validity,
} as const;
