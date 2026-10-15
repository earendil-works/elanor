import {Heading, Stack} from '@earendil-works/elanor-react';

export default function HeadingMarketing() {
  return (
    <Stack gap="medium">
      <Heading level={3} variant="marketing" size="display">
        Display
      </Heading>
      <Heading level={3} variant="marketing" size={1}>
        Size 1
      </Heading>
      <Heading level={3} variant="marketing" size={2}>
        Size 2
      </Heading>
      <Heading level={3} variant="marketing" size={3}>
        Size 3
      </Heading>
      <Heading level={3} variant="marketing" size={4}>
        Size 4
      </Heading>
      <Heading level={3} variant="marketing" size={5}>
        Size 5
      </Heading>
      <Heading level={3} variant="marketing">
        Size 6 (default)
      </Heading>
    </Stack>
  );
}
