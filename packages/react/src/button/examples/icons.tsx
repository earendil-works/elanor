import {AddIcon, ArrowForwardIcon} from '@earendil-works/elanor-icons-react';
import {Button, Stack} from '@earendil-works/elanor-react';

export default function ButtonIcons() {
  return (
    <Stack direction="row" gap="small" wrap="wrap">
      <Button iconStart={<AddIcon />}>New project</Button>
      <Button hierarchy="secondary" iconEnd={<ArrowForwardIcon />}>
        Continue
      </Button>
    </Stack>
  );
}
