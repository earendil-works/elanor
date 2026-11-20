import {AddIcon, ArrowUpwardIcon} from '@earendil-works/elanor-icons-react';
import {Composer, Dropdown, IconButton, Stack, Text, TextArea} from '@earendil-works/elanor-react';

const models = [
  {value: 'opus', label: 'Claude Opus'},
  {value: 'sonnet', label: 'Claude Sonnet'},
];

export default function ComposerAlign() {
  return (
    <Stack gap="small" align="stretch">
      <Text>The prompt's text lines up with this paragraph.</Text>
      <Composer.Panel align="text">
        <Composer.Header>
          <Text>Replying to Sam Lee</Text>
        </Composer.Header>
        <Composer.Field>
          <TextArea rows={1} aria-label="Message" placeholder="Message Pi…" />
          <Composer.Controls>
            <IconButton density="default" aria-label="Attach files">
              <AddIcon />
            </IconButton>
            <IconButton
              density="default"
              hierarchy="primary"
              aria-label="Send"
              data-composer-submit
            >
              <ArrowUpwardIcon />
            </IconButton>
          </Composer.Controls>
        </Composer.Field>
        <Composer.Footer>
          <Dropdown.Root items={models} defaultValue="sonnet">
            <Dropdown.Trigger density="compact" aria-label="Model">
              <Dropdown.Value />
              <Dropdown.Icon />
            </Dropdown.Trigger>
            <Dropdown.Portal>
              <Dropdown.Positioner>
                <Dropdown.Popup>
                  <Dropdown.List>
                    {models.map((model) => (
                      <Dropdown.Item key={model.value} value={model.value}>
                        {model.label}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.List>
                </Dropdown.Popup>
              </Dropdown.Positioner>
            </Dropdown.Portal>
          </Dropdown.Root>
          <Composer.Status>
            <Composer.StatusItem>$0.84</Composer.StatusItem>
          </Composer.Status>
        </Composer.Footer>
      </Composer.Panel>
    </Stack>
  );
}
