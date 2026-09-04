'use client';

import {Field as BaseField} from '@base-ui/react/field';
import {Input as BaseInput} from '@base-ui/react/input';
import {forwardRef, type ComponentPropsWithoutRef} from 'react';
import styles from './field.module.css';
import {classes, mergeClassName} from './shared.js';

export const FieldRoot = forwardRef<HTMLDivElement, BaseField.Root.Props>(function FieldRoot(
  {className, ...props},
  ref,
) {
  return (
    <BaseField.Root
      {...props}
      ref={ref}
      className={mergeClassName<BaseField.Root.State>(styles.field, className)}
    />
  );
});

export const FieldLabel = forwardRef<HTMLElement, BaseField.Label.Props>(function FieldLabel(
  {className, ...props},
  ref,
) {
  return (
    <BaseField.Label
      {...props}
      ref={ref}
      className={mergeClassName<BaseField.Label.State>(styles.label, className)}
    />
  );
});

export const FieldControl = forwardRef<HTMLElement, BaseField.Control.Props>(function FieldControl(
  {className, ...props},
  ref,
) {
  return (
    <BaseField.Control
      {...props}
      ref={ref}
      className={mergeClassName<BaseField.Control.State>(styles.control, className)}
    />
  );
});

export const FieldDescription = forwardRef<HTMLParagraphElement, BaseField.Description.Props>(
  function FieldDescription({className, ...props}, ref) {
    return (
      <BaseField.Description
        {...props}
        ref={ref}
        className={mergeClassName<BaseField.Description.State>(styles.message, className)}
      />
    );
  },
);

export const FieldError = forwardRef<HTMLDivElement, BaseField.Error.Props>(function FieldError(
  {className, ...props},
  ref,
) {
  return (
    <BaseField.Error
      {...props}
      ref={ref}
      className={mergeClassName<BaseField.Error.State>(classes(styles.message, styles.error), className)}
    />
  );
});

export const FieldItem = forwardRef<HTMLDivElement, BaseField.Item.Props>(function FieldItem(
  props,
  ref,
) {
  return <BaseField.Item {...props} ref={ref} />;
});

export const Field = {
  Root: FieldRoot,
  Label: FieldLabel,
  Control: FieldControl,
  Description: FieldDescription,
  Error: FieldError,
  Validity: BaseField.Validity,
  Item: FieldItem,
} as const;

export interface TextFieldProps extends Omit<BaseInput.Props, 'render'> {}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
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
  {className, ...props},
  ref,
) {
  // Field.Control is intentionally render-polymorphic, but its event props remain input-shaped.
  // A textarea has the same value and validation contract used by the Base UI field adapter.
  const controlProps = props as BaseField.Control.Props;

  return (
    <BaseField.Control
      {...controlProps}
      render={<textarea ref={ref} />}
      className={mergeClassName<BaseField.Control.State>(classes(styles.control, styles.textarea), className)}
    />
  );
});
