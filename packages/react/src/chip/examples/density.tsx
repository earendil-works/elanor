import {DraftIcon} from '@earendil-works/elanor-icons-react';
import {Chip, type ChipDensity, Stack} from '@earendil-works/elanor-react';

const densities: ReadonlyArray<ChipDensity> = ['default', 'compact'];

export default function ChipDensityExample() {
  return (
    <Stack gap="small">
      {densities.map((density) => (
        <Stack key={density} direction="row" align="center" gap="xSmall" wrap="wrap">
          <Chip.Root variant="soft" density={density}>
            <Chip.Icon>
              <DraftIcon />
            </Chip.Icon>
            <Chip.Label>quarterly-report.pdf</Chip.Label>
          </Chip.Root>
          <Chip.Root variant="soft" density={density}>
            <Chip.Icon>
              <DraftIcon />
            </Chip.Icon>
            <Chip.Label>quarterly-report.pdf</Chip.Label>
            <Chip.Remove aria-label="Remove quarterly-report.pdf" />
          </Chip.Root>
        </Stack>
      ))}
    </Stack>
  );
}
