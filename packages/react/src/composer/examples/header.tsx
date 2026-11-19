import {ArrowUpwardIcon} from '@earendil-works/elanor-icons-react';
import {Composer, IconButton, Text, TextArea} from '@earendil-works/elanor-react';

export default function ComposerHeader() {
  return (
    <Composer.Panel>
      <Composer.Header>
        <Text role="alert">
          Your last message wasn't sent. Check your connection and try again.
        </Text>
        <Text>Replying to Sam Lee</Text>
      </Composer.Header>
      <Composer.Field>
        <TextArea rows={1} aria-label="Message" placeholder="Message Pi…" />
        <Composer.Controls>
          <IconButton density="default" hierarchy="primary" aria-label="Send" data-composer-submit>
            <ArrowUpwardIcon />
          </IconButton>
        </Composer.Controls>
      </Composer.Field>
    </Composer.Panel>
  );
}
