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
      <Heading level={3} size={3}>
        Size 3
      </Heading>
      <Heading level={3} size={4}>
        Size 4
      </Heading>
      <Heading level={3} size={5}>
        Size 5
      </Heading>
      <Heading level={3}>Size 6 (default)</Heading>
    </Stack>
  );
}
