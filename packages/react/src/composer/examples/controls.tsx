import {MicIcon} from '@earendil-works/elanor-icons-react';
import {Composer, IconButton, Stack, type ComposerValue} from '@earendil-works/elanor-react';

const toText = (value: ComposerValue) => Composer.toText(value, (chip) => chip.label);

export default function ComposerControls() {
  return (
    <Composer.Root toText={toText}>
      <Composer.Panel>
        <Composer.Field>
          <Composer.Prompt aria-label="Message" placeholder="Write a message…" />
          <Composer.Controls render={<Stack direction="row" gap="auto" align="center" />}>
            <Composer.Attach aria-label="Attach files" />
            <Stack direction="row" gap="xSmall" align="center">
              <IconButton density="default" aria-label="Dictate">
                <MicIcon />
              </IconButton>
              <Composer.Submit />
            </Stack>
          </Composer.Controls>
        </Composer.Field>
      </Composer.Panel>
    </Composer.Root>
  );
}
