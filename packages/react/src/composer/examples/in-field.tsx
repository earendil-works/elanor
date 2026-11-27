import {
  Button,
  Composer,
  Field,
  Form,
  Stack,
  Text,
  type ComposerValue,
} from '@earendil-works/elanor-react';
import {useState} from 'react';

import styles from './composer.module.css';

const toText = (value: ComposerValue) => Composer.valueToText(value, (chip) => chip.label);

export default function ComposerInField() {
  const [sent, setSent] = useState('Nothing sent yet.');

  return (
    <Form onFormSubmit={(values) => setSent(`Sent: ${String(values.feedback)}`)}>
      <Stack gap="small" align="stretch">
        <Field.Root name="feedback">
          {/* Not a native label: a native one can't focus the prompt. */}
          <Field.Label nativeLabel={false} render={<span />}>
            Feedback
          </Field.Label>
          <Composer.Root toText={toText} required>
            <Composer.Panel>
              <Composer.InputGroup>
                <Composer.Prompt placeholder="What should we improve?" />
                <Composer.Controls className={styles.end}>
                  <Composer.Submit />
                </Composer.Controls>
              </Composer.InputGroup>
            </Composer.Panel>
          </Composer.Root>
          <Field.Error match="valueMissing">Write something before sending.</Field.Error>
        </Field.Root>
        <Stack direction="row" gap="small" align="center">
          <Button type="reset" hierarchy="secondary">
            Reset
          </Button>
          <Text role="status">{sent}</Text>
        </Stack>
      </Stack>
    </Form>
  );
}
