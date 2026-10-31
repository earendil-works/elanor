import {Button, Field, Form, OTPField, Stack} from '@earendil-works/elanor-react';

const LENGTH = 6;

export default function OTPFieldValidation() {
  return (
    <Form>
      <Stack gap="medium">
        <Field.Root name="code">
          <Field.Label>Verification code</Field.Label>
          <OTPField.Root length={LENGTH} required>
            {Array.from({length: LENGTH}, (_, index) => (
              <OTPField.Input
                key={index}
                aria-label={index === 0 ? undefined : `Character ${index + 1} of ${LENGTH}`}
              />
            ))}
          </OTPField.Root>
          <Field.Error match="valueMissing">Enter the code from the email.</Field.Error>
          <Field.Error match="patternMismatch">Enter all 6 digits.</Field.Error>
        </Field.Root>
        <Button type="submit">Verify</Button>
      </Stack>
    </Form>
  );
}
