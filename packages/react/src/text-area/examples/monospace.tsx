import {Field, TextArea} from '@earendil-works/elanor-react';

export default function TextAreaMonospace() {
  return (
    <Field.Root name="configuration">
      <Field.Label>Configuration</Field.Label>
      <TextArea
        monospace
        rows={6}
        spellCheck={false}
        autoCapitalize="none"
        autoCorrect="off"
        defaultValue={JSON.stringify(
          {name: 'design-reviews', public: false, retention: 30},
          null,
          2,
        )}
      />
      <Field.Description>A JSON object.</Field.Description>
    </Field.Root>
  );
}
