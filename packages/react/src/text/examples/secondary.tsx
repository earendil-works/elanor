import {Stack, Text} from '@earendil-works/elanor-react';

export default function TextSecondary() {
  return (
    <Stack gap="xSmall">
      <Text>Weekly report</Text>
      <Text hierarchy="secondary">Sent every Monday to everyone in the project.</Text>
    </Stack>
  );
}
