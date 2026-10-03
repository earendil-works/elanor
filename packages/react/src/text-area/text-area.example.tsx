import {Stack, Text, TextArea} from '@earendil-works/elanor-react';

export function TextAreaExample() {
  return (
    <Stack gap="small">
      <label htmlFor="project-description">Project description</label>
      <TextArea
        id="project-description"
        name="description"
        rows={4}
        maxLength={240}
        defaultValue="A shared space for our team's design reviews and release notes."
        aria-describedby="description-hint"
      />
      <Text id="description-hint">Up to 240 characters.</Text>
    </Stack>
  );
}
