import {ContentPasteIcon} from '@earendil-works/elanor-icons-react';
import {Chip, Composer, Tooltip, type ComposerValue} from '@earendil-works/elanor-react';

import styles from './composer.module.css';

type Pasted = {id: string; label: string; text: string};

/** More lines than the prompt shows at once. */
const MAX_LINES = 10;

let pastes = 0;

const getPastedValue = (text: string): ComposerValue<Pasted> => {
  const lines = text.split('\n').length;
  if (lines <= MAX_LINES) return [text];
  return [{id: `pasted-${(pastes += 1)}`, label: `${lines} lines`, text}];
};

const log = Array.from({length: 142}, (_, line) => `[build] step ${line + 1} of 142`).join('\n');

const draft: ComposerValue<Pasted> = [
  'Why does this fail? ',
  {id: 'log', label: '142 lines', text: log},
  ' It started after the update.',
];

// Sent as the text it stands for, in its place.
const toText = (value: ComposerValue<Pasted>) => Composer.toText(value, (chip) => chip.text);

// Its tooltip shows the first lines.
const renderChip = (chip: Pasted) => (
  <Tooltip.Root>
    <Tooltip.Trigger render={<Chip.Root variant="soft" density="compact" />}>
      <Chip.Icon>
        <ContentPasteIcon />
      </Chip.Icon>
      <Chip.Label>Pasted</Chip.Label>
      <Chip.Separator />
      <Chip.Label>{chip.label}</Chip.Label>
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Positioner>
        <Tooltip.Popup className={styles.lines}>
          {chip.text.split('\n').slice(0, 3).join('\n')}
        </Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
);

export default function ComposerLongPaste() {
  return (
    <Composer.Root
      defaultValue={draft}
      toText={toText}
      getPastedValue={getPastedValue}
      chipDeletion="select"
      getChipDescription={() => 'pasted text'}
      renderChip={renderChip}
    >
      <Composer.Panel>
        <Composer.Field>
          <Composer.Prompt aria-label="Message" placeholder="Paste a log of more than ten lines…" />
          <Composer.Controls className={styles.end}>
            <Composer.Submit />
          </Composer.Controls>
        </Composer.Field>
      </Composer.Panel>
    </Composer.Root>
  );
}
