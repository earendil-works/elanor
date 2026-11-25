import {DescriptionIcon, DraftIcon} from '@earendil-works/elanor-icons-react';
import {Chip, Composer, type ComposerValue} from '@earendil-works/elanor-react';

import styles from './composer.module.css';

type Reference =
  | {id: string; label: string; kind: 'quote'; text: string}
  | {id: string; label: string; kind: 'file'; path: string};

const draft: ComposerValue<Reference> = [
  {id: 'q1', label: 'Quoted response', kind: 'quote', text: 'Run the migration before the deploy.'},
  'Why before and not after? The deploy runs ',
  {id: 'f1', label: 'deploy.yml', kind: 'file', path: '.github/workflows/deploy.yml'},
  ' first.',
];

const toText = (value: ComposerValue<Reference>) =>
  Composer.toText(value, (chip) =>
    chip.kind === 'quote' ? `> ${chip.text}\n\n` : `@${chip.path}`,
  );

export default function ComposerChips() {
  return (
    <Composer.Root
      defaultValue={draft}
      toText={toText}
      // A quote is costly to lose: the first Backspace selects it. A file turns back into its path.
      chipDeletion={(chip) => (chip.kind === 'quote' ? 'select' : 'revert')}
      getChipDescription={(chip) => (chip.kind === 'quote' ? 'quote' : 'file')}
      renderChip={(chip) => (
        <Chip.Root
          variant="soft"
          density="compact"
          title={chip.kind === 'file' ? chip.path : undefined}
        >
          <Chip.Icon>{chip.kind === 'quote' ? <DescriptionIcon /> : <DraftIcon />}</Chip.Icon>
          {chip.kind === 'quote' ? (
            <>
              <Chip.Label>Quoted response:</Chip.Label>
              <Chip.Label render={<q />}>{chip.text}</Chip.Label>
            </>
          ) : (
            <Chip.Label>{chip.label}</Chip.Label>
          )}
          <Chip.Remove />
        </Chip.Root>
      )}
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
