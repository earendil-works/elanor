import {Heading, Stack} from '@earendil-works/elanor-react';

export function HeadingExample(): React.JSX.Element {
  return (
    <Stack gap="large">
      <Heading level={1} size={1}>Projects</Heading>
      <Heading level={2} size={2}>Team settings</Heading>
      <Heading level={3}>Recent activity</Heading>
    </Stack>
  );
}
