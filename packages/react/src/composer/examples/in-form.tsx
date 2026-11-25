import {Composer, Stack, Text, type ComposerValue} from '@earendil-works/elanor-react';
import {useState} from 'react';

import styles from './composer.module.css';

const toText = (value: ComposerValue) => Composer.toText(value, (chip) => chip.label);

export default function ComposerInForm() {
  const [sent, setSent] = useState('Nothing sent yet.');

  return (
    <Stack gap="small" align="stretch">
      <Composer.Root
        toText={toText}
        onSubmit={(value, {event}) =>
          setSent(`Sent with a ${event?.type ?? 'call'} event: ${toText(value)}`)
        }
      >
        <Composer.Panel render={<form />}>
          <Composer.Field>
            <Composer.Prompt aria-label="Message" placeholder="Write a message…" />
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
