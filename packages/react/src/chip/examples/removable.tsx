import {Button, Chip, Stack} from '@earendil-works/elanor-react';
import {useRef, useState} from 'react';
import {flushSync} from 'react-dom';

const filters = ['Open', 'Assigned to me', 'This week'];

export default function ChipRemovable() {
  const [labels, setLabels] = useState(filters);
  const chips = useRef<HTMLDivElement>(null);
  const reset = useRef<HTMLButtonElement>(null);

  function remove(index: number) {
    flushSync(() => setLabels((current) => current.filter((_, item) => item !== index)));
    const buttons = chips.current?.querySelectorAll('button') ?? [];
    (buttons[index] ?? buttons[index - 1] ?? reset.current)?.focus();
  }

  return (
    <Stack direction="row" align="center" gap="xSmall" wrap="wrap">
      <Stack ref={chips} direction="row" gap="xSmall" wrap="wrap">
        {labels.map((label, index) => (
          <Chip.Root key={label}>
            <Chip.Label>{label}</Chip.Label>
            <Chip.Remove aria-label={`Remove ${label} filter`} onClick={() => remove(index)} />
          </Chip.Root>
        ))}
      </Stack>
      <Button ref={reset} hierarchy="tertiary" onClick={() => setLabels(filters)}>
        Reset filters
      </Button>
    </Stack>
  );
}
