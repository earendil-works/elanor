import {DraftIcon, FormatQuoteIcon} from '@earendil-works/elanor-icons-react';
import {Chip, Text} from '@earendil-works/elanor-react';
import {useState} from 'react';

export default function ChipInText() {
  const [quoted, setQuoted] = useState(true);

  return (
    <Text>
      Compare the totals in{' '}
      <Chip.Root variant="soft" density="compact">
        <Chip.Icon>
          <DraftIcon />
        </Chip.Icon>
        <Chip.Label>quarterly-report.pdf</Chip.Label>
      </Chip.Root>{' '}
      with the figures from the call
      {quoted ? (
        <>
          {' '}
          <Chip.Root variant="soft" density="compact">
            <Chip.Icon>
              <FormatQuoteIcon />
            </Chip.Icon>
            <Chip.Label>Quoted response:</Chip.Label>
            <Chip.Label render={<q />}>Revenue grew 12% over the third quarter</Chip.Label>
            <Chip.Remove aria-label="Remove quoted response" onClick={() => setQuoted(false)} />
          </Chip.Root>
        </>
      ) : null}
      , and tell me which one is off, and by how much, before Friday's review with the finance team.
    </Text>
  );
}
