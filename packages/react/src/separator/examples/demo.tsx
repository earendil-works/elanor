import {Separator, Stack, Text} from '@earendil-works/elanor-react';

export default function SeparatorDemo() {
  return (
    <Stack gap="medium" align="stretch">
      <Text>Account settings</Text>
      <Separator />
      <Text>Workspace settings</Text>
    </Stack>
  );
}
