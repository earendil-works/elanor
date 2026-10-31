import {Field, OTPField} from '@earendil-works/elanor-react';

const LENGTH = 6;

export default function OTPFieldDemo() {
  return (
    <Field.Root name="code">
      <Field.Label>Verification code</Field.Label>
      <OTPField.Root length={LENGTH}>
        {Array.from({length: LENGTH}, (_, index) => (
          <OTPField.Input
            key={index}
            aria-label={index === 0 ? undefined : `Character ${index + 1} of ${LENGTH}`}
          />
        ))}
      </OTPField.Root>
    </Field.Root>
  );
}
