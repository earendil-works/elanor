import {OTPField as BaseOTPField} from '@base-ui/react/otp-field';

import {mergeClassName} from '../utils/class-names.ts';

import styles from './otp-field.module.css';

export type {
  OTPFieldRootState,
  OTPFieldRootChangeEventReason,
  OTPFieldRootChangeEventDetails,
  OTPFieldRootCompleteEventReason,
  OTPFieldRootCompleteEventDetails,
  OTPFieldRootInvalidEventReason,
  OTPFieldRootInvalidEventDetails,
  OTPFieldInputState,
} from '@base-ui/react/otp-field';

export type OTPFieldRootProps = BaseOTPField.Root.Props;
export type OTPFieldValidationType = BaseOTPField.Root.ValidationType;
export type OTPFieldInputProps = BaseOTPField.Input.Props;
export type OTPFieldSeparatorProps = BaseOTPField.Separator.Props;

/** Groups the slots and owns the value. Render one `Input` per character of `length`. */
export function OTPFieldRoot({ref, className, ...props}: OTPFieldRootProps) {
  return (
    <BaseOTPField.Root
      {...props}
      ref={ref}
      className={mergeClassName<BaseOTPField.Root.State>(styles.root, className)}
    />
  );
}

/** One character slot. Label every slot after the first, for example "Character 2 of 6". */
export function OTPFieldInput({ref, className, ...props}: OTPFieldInputProps) {
  return (
    <BaseOTPField.Input
      {...props}
      ref={ref}
      className={mergeClassName<BaseOTPField.Input.State>(styles.input, className)}
    />
  );
}

/** Splits the slots into groups, such as 123–456. */
export function OTPFieldSeparator({ref, className, ...props}: OTPFieldSeparatorProps) {
  return (
    <BaseOTPField.Separator
      {...props}
      ref={ref}
      className={mergeClassName<BaseOTPField.Separator.State>(styles.separator, className)}
    />
  );
}
