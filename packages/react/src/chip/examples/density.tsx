import {DraftIcon} from '@earendil-works/elanor-icons-react';
import {Chip, type ChipDensity, Stack} from '@earendil-works/elanor-react';

const densities: ReadonlyArray<ChipDensity> = ['default', 'compact'];

export default function ChipDensityExample() {
  return (
    <Stack direction="row" align="center" gap="xSmall">
      {densities.map((density) => (
        <Chip.Root key={density} density={density}>
          <Chip.Icon>
            <DraftIcon />
          </Chip.Icon>
          <Chip.Label>quarterly-report.pdf</Chip.Label>
        </Chip.Root>
      ))}
    </Stack>
  );
}
