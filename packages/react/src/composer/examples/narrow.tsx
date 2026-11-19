import {ArrowUpwardIcon} from '@earendil-works/elanor-icons-react';
import {Composer, Dropdown, IconButton, Meter, TextArea} from '@earendil-works/elanor-react';

import styles from './composer.module.css';

const models = [
  {value: 'opus', label: 'Claude Opus 4.1 with extended thinking'},
  {value: 'sonnet', label: 'Claude Sonnet 4.5 with extended thinking'},
];

const levels = [
  {value: 'low', label: 'Low'},
  {value: 'high', label: 'High'},
];

export default function ComposerNarrow() {
  return (
    <Composer.Panel className={styles.narrow}>
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
          <Composer.StatusItem>CH 97%</Composer.StatusItem>
          <Composer.StatusItem>$0.84</Composer.StatusItem>
        </Composer.Status>
      </Composer.Footer>
    </Composer.Panel>
  );
}
