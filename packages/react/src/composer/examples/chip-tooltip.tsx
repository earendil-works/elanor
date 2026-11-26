import {DnsIcon, UploadIcon} from '@earendil-works/elanor-icons-react';
import {Chip, Composer, Tooltip, type ComposerValue} from '@earendil-works/elanor-react';

import styles from './composer.module.css';

type FileChip = {
  id: string;
  label: string;
  place: string;
  path: string;
  uploadId?: string;
};

const draft: ComposerValue<FileChip> = [
  'Compare ',
  {id: 'f1', label: 'design.png', place: 'devbox', path: 'docs/design.png'},
  ' with ',
  {id: 'f2', label: 'screen.png', place: 'Upload', path: 'screen.png', uploadId: 'u1'},
  '.',
];

// Your uploads' state, kept out of the chips, by an id of yours: a copy of a chip gets a new `id`.
const failures = new Map([['u1', 'Upload failed: connection lost']]);

const fileText = (chip: FileChip) =>
  `@${chip.place === 'Upload' ? 'uploads' : chip.place}:${chip.path}`;

const toText = (value: ComposerValue<FileChip>) => Composer.toText(value, fileText);

const failureOf = (chip: FileChip) =>
  chip.uploadId === undefined ? undefined : failures.get(chip.uploadId);

// Said to screen readers too: the tooltip is for a pointer only.
const describe = (chip: FileChip) => {
  const failure = failureOf(chip);
  return failure ? `file, ${failure}` : 'file';
};

const renderChip = (chip: FileChip) => {
  const failure = failureOf(chip);
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <Chip.Root variant="soft" density="compact" semantic={failure ? 'negative' : 'neutral'} />
        }
      >
        <Chip.Icon>{chip.place === 'Upload' ? <UploadIcon /> : <DnsIcon />}</Chip.Icon>
        <Chip.Label>{chip.place}</Chip.Label>
        <Chip.Separator />
        <Chip.Label>{chip.label}</Chip.Label>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner>
          <Tooltip.Popup>{failure ?? fileText(chip)}</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};

export default function ComposerChipTooltip() {
  return (
    <Composer.Root
      defaultValue={draft}
      toText={toText}
      getChipDescription={describe}
      renderChip={renderChip}
    >
      <Composer.Panel>
        <Composer.Field>
          <Composer.Prompt aria-label="Message" placeholder="Write a message…" />
          <Composer.Controls className={styles.end}>
            <Composer.Submit />
          </Composer.Controls>
        </Composer.Field>
      </Composer.Panel>
    </Composer.Root>
  );
}
