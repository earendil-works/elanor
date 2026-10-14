import {Field, Input} from '@earendil-works/elanor-react';

export default function FieldValidation() {
  return (
    <Field.Root name="email" validationMode="onBlur">
      <Field.Label>Email</Field.Label>
      <Input type="email" autoComplete="email" placeholder="name@example.com" required />
      <Field.Error match="valueMissing">Enter your email address.</Field.Error>
      <Field.Error match="typeMismatch">Enter a valid email address.</Field.Error>
    </Field.Root>
  );
}
