import {Field, Input} from '@earendil-works/elanor-react';

export default function FieldDemo() {
  return (
    <Field.Root name="email">
      <Field.Label>Email</Field.Label>
      <Input type="email" autoComplete="email" placeholder="name@example.com" />
      <Field.Description>Used for project notifications.</Field.Description>
    </Field.Root>
  );
}
