import {Button, Stack} from '@earendil-works/elanor-react';

export default function ButtonDensity() {
  return (
    <Stack direction="row" gap="small" align="center" wrap="wrap">
      <Button>Default</Button>
      <Button density="compact">Compact</Button>
    </Stack>
  );
}
