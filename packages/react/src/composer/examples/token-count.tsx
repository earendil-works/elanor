import {Composer, Stack, type ComposerValue} from '@earendil-works/elanor-react';

import styles from './composer.module.css';

const toText = (value: ComposerValue) => Composer.toText(value, (chip) => chip.label);

function TokenCount() {
  // Demo only: about four characters a token. Count with your model's tokenizer instead, kept cheap
  // enough for every edit.
  const tokens = Composer.useValue((value) => Math.ceil(toText(value).length / 4));
  return <span>{`~${tokens} tokens`}</span>;
}

export default function ComposerTokenCount() {
  return (
    <Composer.Root toText={toText} defaultValue={['Summarize the release notes for 4.2.']}>
      <Composer.Panel>
        <Composer.Field>
          <Composer.Prompt aria-label="Message" placeholder="Write a message…" />
          <Composer.Controls className={styles.end}>
            <Composer.Submit />
          </Composer.Controls>
        </Composer.Field>
        <Composer.Footer>
          <Stack direction="row" gap="medium" className={styles.figures}>
            <TokenCount />
          </Stack>
        </Composer.Footer>
      </Composer.Panel>
    </Composer.Root>
  );
}
