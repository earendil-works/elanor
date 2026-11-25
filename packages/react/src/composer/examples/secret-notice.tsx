import {Composer, Text, type ComposerValue} from '@earendil-works/elanor-react';

import styles from './composer.module.css';

const toText = (value: ComposerValue) => Composer.toText(value, (chip) => chip.label);

const secret = /\b(?:sk|ghp|xox[bp])-[A-Za-z0-9]{16,}/;

function SecretNotice() {
  // A boolean: renders again only when the answer changes, not on every key.
  const found = Composer.useValue((value) => secret.test(toText(value)));
  // Mounted before it has anything to say, so screen readers notice when it does.
  return <Text role="status">{found ? 'This looks like a key or a password.' : ''}</Text>;
}

export default function ComposerSecretNotice() {
  return (
    <Composer.Root toText={toText} defaultValue={['Deploy with the key sk-test0000000000000000']}>
      <Composer.Panel>
        <Composer.Header>
          <SecretNotice />
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
