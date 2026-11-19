import {AddIcon, ArrowUpwardIcon, MicIcon} from '@earendil-works/elanor-icons-react';
import {Composer, Dropdown, IconButton, Meter, TextArea} from '@earendil-works/elanor-react';

const models = [
  {value: 'opus', label: 'Claude Opus'},
  {value: 'sonnet', label: 'Claude Sonnet'},
];

export default function ComposerDemo() {
  return (
    <Composer.Panel>
      <Composer.Field>
        <TextArea rows={2} aria-label="Message" placeholder="Message Pi…" />
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
          <Meter.Root value={42} aria-label="Context used">
            <Meter.Track>
              <Meter.Indicator />
            </Meter.Track>
            <Meter.Value />
          </Meter.Root>
          <Composer.StatusItem>$0.84</Composer.StatusItem>
        </Composer.Status>
      </Composer.Footer>
    </Composer.Panel>
  );
}
