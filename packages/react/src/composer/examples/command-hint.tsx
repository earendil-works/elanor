import {TerminalIcon} from '@earendil-works/elanor-icons-react';
import {Chip, Composer, Text, type ComposerValue} from '@earendil-works/elanor-react';

import styles from './composer.module.css';

type Command = {id: string; label: string; description: string};

const review: Command = {id: 'review', label: 'review', description: 'Reviews the current branch.'};

const toText = (value: ComposerValue<Command>) =>
  Composer.toText(value, (command) => `/${command.label}`);

function CommandHint() {
  // A string or null: renders again only when the leading command changes.
  const hint = Composer.useValue((value: ComposerValue<Command>) => {
    const [first] = value;
    return Composer.isChip(first) ? first.description : null;
  });
  return hint ? <Text>{hint}</Text> : null;
}

const renderChip = (command: Command) => (
  <Chip.Root variant="soft" density="compact">
    <Chip.Icon>
      <TerminalIcon />
    </Chip.Icon>
    <Chip.Label>{`/${command.label}`}</Chip.Label>
  </Chip.Root>
);

export default function ComposerCommandHint() {
  return (
    <Composer.Root
      toText={toText}
      defaultValue={[review, ' and focus on the tests']}
      renderChip={renderChip}
    >
      <Composer.Panel>
        <Composer.Field>
          <Composer.Prompt aria-label="Message" placeholder="Write a message…" />
          <Composer.Controls className={styles.end}>
            <Composer.Submit />
          </Composer.Controls>
        </Composer.Field>
        <Composer.Footer>
          <CommandHint />
        </Composer.Footer>
      </Composer.Panel>
    </Composer.Root>
  );
}
