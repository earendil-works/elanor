import {Composer, Stack, type ComposerValue} from '@earendil-works/elanor-react';

const toText = (value: ComposerValue) => Composer.valueToText(value, (chip) => chip.label);

export default function ComposerDisabled() {
  return (
    <Stack gap="large" align="stretch">
      <Composer.Root toText={toText} disabled>
        <Composer.Panel>
          <Composer.InputGroup>
            <Composer.Prompt aria-label="Message" placeholder="Sign in to send messages" />
            <Composer.Controls render={<Stack direction="row" gap="auto" align="center" />}>
              <Composer.Attach aria-label="Attach files" />
              <Composer.Submit />
            </Composer.Controls>
          </Composer.InputGroup>
        </Composer.Panel>
      </Composer.Root>
      <Composer.Root
        toText={toText}
        readOnly
        defaultValue={['Only the session owner can write here. You can still copy this text.']}
      >
        <Composer.Panel>
          <Composer.InputGroup>
            <Composer.Prompt aria-label="Message" />
            <Composer.Controls render={<Stack direction="row" gap="auto" align="center" />}>
              <Composer.Attach aria-label="Attach files" />
              <Composer.Submit />
            </Composer.Controls>
          </Composer.InputGroup>
        </Composer.Panel>
      </Composer.Root>
    </Stack>
  );
}
