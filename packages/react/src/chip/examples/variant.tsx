import {DraftIcon} from '@earendil-works/elanor-icons-react';
import {Chip, Stack} from '@earendil-works/elanor-react';

export default function ChipVariant() {
  return (
    <Stack direction="row" gap="xSmall">
      <Chip.Root>
        <Chip.Icon>
          <DraftIcon />
        </Chip.Icon>
        <Chip.Label>quarterly-report.pdf</Chip.Label>
      </Chip.Root>
      <Chip.Root variant="soft">
        <Chip.Icon>
          <DraftIcon />
        </Chip.Icon>
        <Chip.Label>quarterly-report.pdf</Chip.Label>
      </Chip.Root>
    </Stack>
  );
}
