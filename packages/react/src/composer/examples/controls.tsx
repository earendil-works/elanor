import {AddIcon, ArrowUpwardIcon, MicIcon} from '@earendil-works/elanor-icons-react';
import {Composer, IconButton, TextArea} from '@earendil-works/elanor-react';

export default function ComposerControls() {
  return (
    <Composer.Panel>
      <Composer.Field>
        <TextArea rows={1} aria-label="Message" placeholder="Message Pi…" />
        <Composer.Controls>
          <IconButton density="default" aria-label="Attach files">
            <AddIcon />
          </IconButton>
          <Composer.ControlGroup>
            <IconButton density="default" aria-label="Dictate">
              <MicIcon />
            </IconButton>
            <IconButton
              density="default"
              hierarchy="primary"
              aria-label="Send"
              data-composer-submit
            >
              <ArrowUpwardIcon />
            </IconButton>
          </Composer.ControlGroup>
        </Composer.Controls>
      </Composer.Field>
    </Composer.Panel>
  );
}
