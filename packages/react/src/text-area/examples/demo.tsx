import {Field, TextArea} from '@earendil-works/elanor-react';

export default function TextAreaDemo() {
  return (
    <Field.Root name="description">
      <Field.Label>Project description</Field.Label>
      <TextArea
        rows={4}
        maxLength={240}
        defaultValue="A shared space for our team's design reviews and release notes."
      />
      <Field.Description>Up to 240 characters.</Field.Description>
    </Field.Root>
  );
}
