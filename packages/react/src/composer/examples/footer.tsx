import {ArrowUpwardIcon} from '@earendil-works/elanor-icons-react';
import {Composer, Dropdown, IconButton, Meter, TextArea} from '@earendil-works/elanor-react';

const models = [
  {value: 'opus', label: 'Claude Opus'},
  {value: 'sonnet', label: 'Claude Sonnet'},
];

const levels = [
  {value: 'low', label: 'Low'},
  {value: 'high', label: 'High'},
];

export default function ComposerFooter() {
  return (
    <Composer.Panel>
      <Composer.Field>
        <TextArea rows={1} aria-label="Message" placeholder="Message Pi…" />
        <Composer.Controls>
          <IconButton density="default" hierarchy="primary" aria-label="Send" data-composer-submit>
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
        <Dropdown.Root items={levels} defaultValue="high">
          <Dropdown.Trigger density="compact" aria-label="Thinking">
            <Dropdown.Value />
            <Dropdown.Icon />
          </Dropdown.Trigger>
          <Dropdown.Portal>
            <Dropdown.Positioner>
              <Dropdown.Popup>
                <Dropdown.List>
                  {levels.map((level) => (
                    <Dropdown.Item key={level.value} value={level.value}>
                      {level.label}
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
          <Meter.Root value={91} semantic="warning" aria-label="Weekly limit used">
            <Meter.Track>
              <Meter.Indicator />
            </Meter.Track>
            <Meter.Value />
          </Meter.Root>
          <Composer.StatusItem>CH 97%</Composer.StatusItem>
          <Composer.StatusItem>$0.84</Composer.StatusItem>
        </Composer.Status>
      </Composer.Footer>
    </Composer.Panel>
  );
}
