import {CopyButton, Stack, Text} from '@earendil-works/elanor-react';

export default function CopyButtonDemo() {
  return (
    <Stack direction="row" align="center" gap="small">
      <Text render={<span />}>workspace-2048</Text>
      <CopyButton value="workspace-2048" aria-label="Copy workspace ID" />
    </Stack>
  );
}
