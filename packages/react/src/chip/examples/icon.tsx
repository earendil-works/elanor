import {DraftIcon} from '@earendil-works/elanor-icons-react';
import {Chip} from '@earendil-works/elanor-react';

export default function ChipIcon() {
  return (
    <Chip.Root>
      <Chip.Icon>
        <DraftIcon />
      </Chip.Icon>
      <Chip.Label>quarterly-report.pdf</Chip.Label>
    </Chip.Root>
  );
}
