import {MicIcon} from '@earendil-works/elanor-icons-react';
import {Composer, IconButton, type ComposerValue} from '@earendil-works/elanor-react';

import styles from './composer.module.css';

const toText = (value: ComposerValue) => Composer.toText(value, (chip) => chip.label);

function DictateButton() {
  const {insert, focus} = Composer.useActions();
  const {disabled, readOnly} = Composer.useStatus();

  return (
    <IconButton
      density="default"
      aria-label="Dictate"
      disabled={disabled || readOnly}
      onClick={() => {
        insert('Summarize the open pull requests.');
        focus({at: 'caret'});
      }}
    >
      <MicIcon />
    </IconButton>
  );
}

export default function ComposerActions() {
  return (
    <Composer.Root toText={toText}>
      <Composer.Panel>
        <Composer.Field>
          <Composer.Prompt aria-label="Message" placeholder="Write a message…" />
          <Composer.Controls className={styles.end}>
            <DictateButton />
            <Composer.Submit />
          </Composer.Controls>
        </Composer.Field>
      </Composer.Panel>
    </Composer.Root>
  );
}
