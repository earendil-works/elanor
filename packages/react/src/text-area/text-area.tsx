import {Field as BaseField} from '@base-ui/react/field';
import {forwardRef, type ComponentPropsWithoutRef} from 'react';
import styles from './text-area.module.css';
import {classes, mergeClassName} from '../utils/class-names.ts';

export interface TextAreaProps
  extends Omit<ComponentPropsWithoutRef<'textarea'>, 'className' | 'style'> {
  readonly className?: BaseField.Control.Props['className'];
  readonly style?: BaseField.Control.Props['style'];
  readonly onValueChange?: BaseField.Control.Props['onValueChange'];
  /** Class for the frame around the textarea, e.g. for sizing it in a flex or grid parent. */
  readonly rootClassName?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    className, rootClassName, style, value, defaultValue, onValueChange, id, name, disabled, autoFocus,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...props
  },
  ref,
) {
  // The frame draws the field: textareas can't host the stroke layer.
  return (
    <span className={classes(styles.frame, rootClassName)} data-stroke="box-small">
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
        className={mergeClassName<BaseField.Control.State>(styles.textarea, className)}
      />
    </span>
  );
});
