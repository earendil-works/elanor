import {Composer, type ComposerValue} from '@earendil-works/elanor-react';
import {useState} from 'react';

import styles from './composer.module.css';

const toText = (value: ComposerValue) => Composer.toText(value, (chip) => chip.label);

function SubmitOrStop({replying, onStop}: {replying: boolean; onStop: () => void}) {
  const {empty} = Composer.useStatus();
  return replying && empty ? (
    <Composer.Stop key="stop" onClick={onStop} />
  ) : (
    <Composer.Submit key="submit" />
  );
}

export default function ComposerStop() {
  const [value, setValue] = useState<ComposerValue>([]);
  const [replying, setReplying] = useState(false);

  return (
    <Composer.Root
      value={value}
      onValueChange={setValue}
      toText={toText}
      onSubmit={() => {
        setValue([]);
        // Demo only: nothing replies. Start your request here, and cancel it in Stop's `onClick`.
        setReplying(true);
      }}
    >
      <Composer.Panel>
        <Composer.Field>
          <Composer.Prompt
            aria-label="Message"
            placeholder={
              replying ? 'Waiting for the reply…' : 'Send a message, then stop the reply…'
            }
          />
          <Composer.Controls className={styles.end}>
            <SubmitOrStop replying={replying} onStop={() => setReplying(false)} />
          </Composer.Controls>
        </Composer.Field>
      </Composer.Panel>
    </Composer.Root>
  );
}
