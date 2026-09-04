import {Field as BaseField} from '@base-ui/react/field';
import {Input as BaseInput} from '@base-ui/react/input';
import {forwardRef, type ComponentPropsWithoutRef} from 'react';
import styles from './field.module.css';
import fieldStyles from './control-label.module.css';
import {classes, mergeClassName} from './shared.ts';

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

export type {
  InputState,
  InputChangeEventReason,
  InputChangeEventDetails,
} from '@base-ui/react/input';

export const FieldRoot = forwardRef<HTMLDivElement, BaseField.Root.Props>(function FieldRoot(
  {className, ...props}, ref,
) {
  return <BaseField.Root {...props} ref={ref} className={mergeClassName<BaseField.Root.State>(fieldStyles.root, className)} />;
});

export const FieldLabel = forwardRef<HTMLElement, BaseField.Label.Props>(function FieldLabel(
  {className, ...props}, ref,
) {
  return <BaseField.Label {...props} ref={ref} className={mergeClassName<BaseField.Label.State>(fieldStyles.label, className)} />;
});

export const FieldDescription = forwardRef<HTMLParagraphElement, BaseField.Description.Props>(function FieldDescription(
  {className, ...props}, ref,
) {
  return <BaseField.Description {...props} ref={ref} className={mergeClassName<BaseField.Description.State>(fieldStyles.description, className)} />;
});

export const FieldError = forwardRef<HTMLDivElement, BaseField.Error.Props>(function FieldError(
  {className, ...props}, ref,
) {
  return <BaseField.Error {...props} ref={ref} className={mergeClassName<BaseField.Error.State>(fieldStyles.error, className)} />;
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

export interface TextAreaProps
  extends Omit<ComponentPropsWithoutRef<'textarea'>, 'className' | 'style'> {
  readonly className?: BaseField.Control.Props['className'];
  readonly style?: BaseField.Control.Props['style'];
  readonly onValueChange?: BaseField.Control.Props['onValueChange'];
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    className, style, value, defaultValue, onValueChange, id, name, disabled, autoFocus,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...props
  },
  ref,
) {
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
      className={mergeClassName<BaseField.Control.State>(classes(styles.control, styles.textarea), className)}
    />
  );
});
