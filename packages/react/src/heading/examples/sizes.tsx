import {Heading, Stack} from '@earendil-works/elanor-react';

export default function HeadingSizes() {
  return (
    <Stack gap="medium">
      <Heading level={3} size={1}>
        Size 1
      </Heading>
      <Heading level={3} size={2}>
        Size 2
      </Heading>
      <Heading level={3}>Size 3 (default)</Heading>
    </Stack>
  );
}
