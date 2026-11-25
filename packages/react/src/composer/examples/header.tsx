import {Composer, Text, type ComposerValue} from '@earendil-works/elanor-react';

import styles from './composer.module.css';

const toText = (value: ComposerValue) => Composer.toText(value, (chip) => chip.label);

export default function ComposerHeader() {
  return (
    <Composer.Root toText={toText}>
      <Composer.Panel>
        <Composer.Header>
          <Text role="alert">
            Your last message wasn't sent. Check your connection and try again.
          </Text>
          <Text>Replying to Sam Lee</Text>
        </Composer.Header>
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
