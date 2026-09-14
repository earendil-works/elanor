import {Field as BaseField} from '@base-ui/react/field';
import {forwardRef} from 'react';
import styles from './field.module.css';
import {mergeClassName} from '../utils/class-names.ts';

export type {
  FieldValidityData,
  FieldRootActions,
  FieldRootState,
  FieldRootProps,
  FieldLabelState,
  FieldLabelProps,
  FieldDescriptionState,
  FieldDescriptionProps,
  FieldErrorState,
  FieldErrorProps,
  FieldControlState,
  FieldControlProps,
  FieldControlChangeEventReason,
  FieldControlChangeEventDetails,
  FieldValidityState,
  FieldValidityProps,
  FieldItemState,
  FieldItemProps,
} from '@base-ui/react/field';

export const FieldRoot = forwardRef<HTMLDivElement, BaseField.Root.Props>(function FieldRoot(
  {className, ...props}, ref,
) {
  return <BaseField.Root {...props} ref={ref} className={mergeClassName<BaseField.Root.State>(styles.root, className)} />;
});

export const FieldLabel = forwardRef<HTMLElement, BaseField.Label.Props>(function FieldLabel(
  {className, ...props}, ref,
) {
  return <BaseField.Label {...props} ref={ref} className={mergeClassName<BaseField.Label.State>(styles.label, className)} />;
});

export const FieldDescription = forwardRef<HTMLParagraphElement, BaseField.Description.Props>(function FieldDescription(
  {className, ...props}, ref,
) {
  return <BaseField.Description {...props} ref={ref} className={mergeClassName<BaseField.Description.State>(styles.description, className)} />;
});

export const FieldError = forwardRef<HTMLDivElement, BaseField.Error.Props>(function FieldError(
  {className, ...props}, ref,
) {
  return <BaseField.Error {...props} ref={ref} className={mergeClassName<BaseField.Error.State>(styles.error, className)} />;
});

export const FieldControl = forwardRef<HTMLElement, BaseField.Control.Props>(function FieldControl(
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
