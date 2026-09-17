import {Field} from './field.tsx';

export function FieldExample(): React.JSX.Element {
  return (
    <Field.Root>
      <Field.Label>Email</Field.Label>
      <Field.Control type="email" placeholder="name@example.com" />
      <Field.Description>Enter your email address.</Field.Description>
    </Field.Root>
  );
}
