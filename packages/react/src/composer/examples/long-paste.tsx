import {ContentPasteIcon} from '@earendil-works/elanor-icons-react';
import {Chip, Composer, type ComposerValue} from '@earendil-works/elanor-react';

import styles from './composer.module.css';

type Pasted = {id: string; label: string; text: string};

/** More lines than the prompt shows at once. */
const MAX_LINES = 10;

const getPastedValue = (text: string): ComposerValue<Pasted> => {
  const lines = text.split('\n').length;
  if (lines <= MAX_LINES) return [text];
  return [{id: crypto.randomUUID(), label: `${lines} lines`, text}];
};

// Sent as the text it stands for, in its place.
const toText = (value: ComposerValue<Pasted>) => Composer.toText(value, (chip) => chip.text);

export default function ComposerLongPaste() {
  return (
    <Composer.Root
      toText={toText}
      getPastedValue={getPastedValue}
      chipDeletion="select"
      getChipDescription={() => 'pasted text'}
      renderChip={(chip) => (
        <Chip.Root variant="soft" density="compact">
          <Chip.Icon>
            <ContentPasteIcon />
          </Chip.Icon>
          <Chip.Label>Pasted</Chip.Label>
          <Chip.Separator />
          <Chip.Label>{chip.label}</Chip.Label>
        </Chip.Root>
      )}
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
