import {FormatQuoteIcon} from '@earendil-works/elanor-icons-react';
import {Chip} from '@earendil-works/elanor-react';

const quote =
  'Run the migration before the deploy, then restart the workers one at a time so the queue keeps draining while each one comes back.';

export default function ChipQuote() {
  return (
    <Chip.Root>
      <Chip.Icon>
        <FormatQuoteIcon />
      </Chip.Icon>
      <Chip.Label>Quoted response:</Chip.Label>
      <Chip.Label render={<q />}>{quote}</Chip.Label>
    </Chip.Root>
  );
}
