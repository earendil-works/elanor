import {Input as BaseInput} from '@base-ui/react/input';
import {forwardRef, type ComponentPropsWithRef} from 'react';
import styles from './input.module.css';
import {useSurfaceClassName} from '../appearance/appearance.tsx';
import {classes, mergeClassName} from '../utils/class-names.ts';

export type {
  InputState,
  InputChangeEventReason,
  InputChangeEventDetails,
} from '@base-ui/react/input';

const inputTypes = ['text', 'email', 'password', 'tel', 'url'] as const;

export type InputType = (typeof inputTypes)[number];

export interface InputProps extends Omit<BaseInput.Props, 'type'> {
  readonly type?: InputType;
  /** Class for the frame around the input, e.g. for sizing it in a flex or grid parent. */
  readonly rootClassName?: string;
  /** Customization of the visible frame; the component ref/style/className still target the input. */
  readonly frameProps?: Omit<ComponentPropsWithRef<'span'>, 'children' | 'dangerouslySetInnerHTML'>;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {className, rootClassName, frameProps, type = 'text', ...props},
  ref,
) {
  const surfaceClassName = useSurfaceClassName();
  if (!inputTypes.includes(type)) {
    throw new TypeError(`Input does not support type="${type}". Use one of: ${inputTypes.join(', ')}.`);
  }

  // The frame owns the visible surface independently of the native control.
  return (
    <span
      data-outline="box-small"
      data-outline-focus="control"
      {...frameProps}
      className={classes(styles.frame, surfaceClassName, rootClassName, frameProps?.className)}
    >
      <BaseInput
        data-surface-control=""
        {...props}
        ref={ref}
        type={type}
        className={mergeClassName<BaseInput.State>(styles.control, className)}
      />
    </span>
  );
});
