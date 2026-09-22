import {Field} from './field.tsx';
import {Input} from '../input/input.tsx';

export function FieldExample(): React.JSX.Element {
  return (
    <Field.Root name="email" validationMode="onBlur">
      <Field.Label>Email</Field.Label>
      <Input type="email" autoComplete="email" placeholder="name@example.com" required />
      <Field.Description>Used for project notifications.</Field.Description>
      <Field.Error match="valueMissing">Enter your email address.</Field.Error>
      <Field.Error match="typeMismatch">Enter a valid email address.</Field.Error>
    </Field.Root>
  );
}
