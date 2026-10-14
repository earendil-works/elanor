import {Button, Stack} from '@earendil-works/elanor-react';

export default function ButtonSemantic() {
  return (
    <Stack direction="row" gap="small" wrap="wrap">
      <Button semantic="negative">Delete project</Button>
      <Button semantic="positive">Approve request</Button>
    </Stack>
  );
}
