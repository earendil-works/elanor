import {Button, Stack} from '@earendil-works/elanor-react';

export default function ButtonHierarchy() {
  return (
    <Stack direction="row" gap="small" wrap="wrap">
      <Button>Primary</Button>
      <Button hierarchy="secondary">Secondary</Button>
      <Button hierarchy="tertiary">Tertiary</Button>
    </Stack>
  );
}
