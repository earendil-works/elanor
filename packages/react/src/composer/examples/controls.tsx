import {AddIcon, ArrowUpwardIcon, MicIcon} from '@earendil-works/elanor-icons-react';
import {Composer, IconButton, Stack, TextArea} from '@earendil-works/elanor-react';

export default function ComposerControls() {
  return (
    <Composer.Panel>
      <Composer.Field>
        <TextArea rows={1} aria-label="Message" placeholder="Write a message…" />
        <Composer.Controls render={<Stack direction="row" gap="auto" align="center" />}>
          <IconButton density="default" aria-label="Attach files">
            <AddIcon />
          </IconButton>
          <Stack direction="row" gap="xSmall" align="center">
            <IconButton density="default" aria-label="Dictate">
              <MicIcon />
            </IconButton>
            <IconButton density="default" hierarchy="primary" aria-label="Send">
              <ArrowUpwardIcon />
            </IconButton>
          </Stack>
        </Composer.Controls>
      </Composer.Field>
    </Composer.Panel>
  );
}
