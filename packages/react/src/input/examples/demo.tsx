import {Field, Input} from '@earendil-works/elanor-react';

export default function InputDemo() {
  return (
    <Field.Root name="email">
      <Field.Label>Email</Field.Label>
      <Input type="email" autoComplete="email" placeholder="name@example.com" />
    </Field.Root>
  );
}
