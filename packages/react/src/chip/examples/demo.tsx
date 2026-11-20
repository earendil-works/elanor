import {Chip, Stack} from '@earendil-works/elanor-react';

export default function ChipDemo() {
  return (
    <Stack direction="row" gap="xSmall">
      <Chip.Root>
        <Chip.Label>Design</Chip.Label>
      </Chip.Root>
      <Chip.Root>
        <Chip.Label>Release notes</Chip.Label>
      </Chip.Root>
    </Stack>
  );
}
