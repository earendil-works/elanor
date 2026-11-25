import {Composer, Stack, Text, type ComposerValue} from '@earendil-works/elanor-react';
import {useState} from 'react';

import styles from './composer.module.css';

const toText = (value: ComposerValue) => Composer.toText(value, (chip) => chip.label);

export default function ComposerSend() {
  const [sent, setSent] = useState('Enter sends. Alt+Enter queues a follow-up.');

  return (
    <Stack gap="small" align="stretch">
      <Composer.Root
        toText={toText}
        onSubmit={(value, {event}) => {
          const followUp = event instanceof KeyboardEvent && event.altKey;
          setSent(`${followUp ? 'Queued as a follow-up' : 'Sent'}: ${toText(value)}`);
        }}
      >
        <Composer.Panel>
          <Composer.Field>
            <Composer.Prompt aria-label="Message" placeholder="Describe the change…" />
            <Composer.Controls className={styles.end}>
              <Composer.Submit />
            </Composer.Controls>
          </Composer.Field>
        </Composer.Panel>
      </Composer.Root>
      <Text role="status">{sent}</Text>
    </Stack>
  );
}
