import {CopyButton, Stack, Text} from '@earendil-works/elanor-react';

export default function CopyButtonWithText() {
  return (
    <Stack direction="row" align="center" gap="small">
      <Text render={<span />}>pnpm add @earendil-works/elanor-react</Text>
      <CopyButton value="pnpm add @earendil-works/elanor-react" aria-label="Copy install command">
        Copy
      </CopyButton>
    </Stack>
  );
}
