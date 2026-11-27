import {DescriptionIcon} from '@earendil-works/elanor-icons-react';
import {
  Chip,
  Composer,
  type ComposerActions,
  type ComposerValue,
} from '@earendil-works/elanor-react';
import {useRef, useState} from 'react';

import styles from './composer.module.css';

type FileChip = {id: string; label: string; path: string};

const toText = (value: ComposerValue<FileChip>) =>
  Composer.toText(value, (chip) => `@${chip.path}`);

const renderChip = (chip: FileChip) => (
  <Chip.Root variant="soft" density="compact">
    <Chip.Icon>
      <DescriptionIcon />
    </Chip.Icon>
    <Chip.Label>{chip.label}</Chip.Label>
  </Chip.Root>
);

// Demo only: earlier messages; load the conversation's sent messages from your store.
const earlier: ComposerValue<FileChip>[] = [
  ['Why does the docs build fail on Node 24?'],
  [
    'Compare ',
    {id: 'build', label: 'build.mjs', path: 'scripts/build.mjs'},
    ' with the version on main.',
  ],
  ['Write the release notes for 0.4, grouped by component.'],
];

/** Inside Root, where `useRecall` finds the prompt. */
function MessagePrompt({sent}: {sent: readonly ComposerValue<FileChip>[]}) {
  const recall = Composer.useRecall(sent);
  return <Composer.Prompt aria-label="Message" placeholder="Write a message…" onKeyDown={recall} />;
}

export default function ComposerRecall() {
  const [sent, setSent] = useState(earlier);
  const [value, setValue] = useState<ComposerValue<FileChip>>([]);
  const actions = useRef<ComposerActions<FileChip>>(null);

  return (
    <Composer.Root
      toText={toText}
      renderChip={renderChip}
      getChipDescription={() => 'file'}
      value={value}
      onValueChange={setValue}
      actionsRef={actions}
      onSubmit={(message) => {
        if (!toText(message).trim()) return;
        setSent((current) => [...current, message]);
        actions.current?.clearHistory();
        setValue([]);
      }}
    >
      <Composer.Panel>
        <Composer.Field>
          <MessagePrompt sent={sent} />
          <Composer.Controls className={styles.end}>
            <Composer.Submit />
          </Composer.Controls>
        </Composer.Field>
      </Composer.Panel>
    </Composer.Root>
  );
}
