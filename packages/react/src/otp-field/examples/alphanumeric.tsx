import {Field, OTPField} from '@earendil-works/elanor-react';

const LENGTH = 8;

function uppercase(value: string) {
  return value.toUpperCase();
}

export default function OTPFieldAlphanumeric() {
  return (
    <Field.Root name="recoveryCode">
      <Field.Label>Recovery code</Field.Label>
      <OTPField.Root length={LENGTH} validationType="alphanumeric" normalizeValue={uppercase}>
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
