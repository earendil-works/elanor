import {Field, OTPField} from '@earendil-works/elanor-react';

const LENGTH = 6;

function slot(index: number) {
  return (
    <OTPField.Input
      key={index}
      aria-label={index === 0 ? undefined : `Character ${index + 1} of ${LENGTH}`}
    />
  );
}

export default function OTPFieldGrouped() {
  return (
    <Field.Root name="code">
      <Field.Label>Verification code</Field.Label>
      <OTPField.Root length={LENGTH}>
        {[0, 1, 2].map(slot)}
        <OTPField.Separator />
        {[3, 4, 5].map(slot)}
      </OTPField.Root>
    </Field.Root>
  );
}
