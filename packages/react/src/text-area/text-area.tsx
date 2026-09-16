import {Field as BaseField} from '@base-ui/react/field';
import {forwardRef, type ComponentPropsWithoutRef} from 'react';
import styles from './text-area.module.css';
import brushStyles from '../brush-border/brush-border.module.css';
import {useBrushVariant, type BrushProps} from '../brush-border/use-brush-variant.ts';
import {classes, mergeClassName} from '../utils/class-names.ts';

export interface TextAreaProps
  extends Omit<ComponentPropsWithoutRef<'textarea'>, 'className' | 'style'>, BrushProps {
  readonly rootClassName?: string;
  readonly className?: BaseField.Control.Props['className'];
  readonly style?: BaseField.Control.Props['style'];
  readonly onValueChange?: BaseField.Control.Props['onValueChange'];
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    className, rootClassName, brushVariant, style, value, defaultValue, onValueChange, id, name, disabled, autoFocus,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...props
  },
  ref,
) {
  return (
    <span
      className={classes(brushStyles.fieldFrame, rootClassName)}
      data-brush-variant={useBrushVariant(brushVariant)}
    >
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
