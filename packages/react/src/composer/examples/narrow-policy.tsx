import {ArrowUpwardIcon} from '@earendil-works/elanor-icons-react';
import {Composer, Dropdown, IconButton, Meter, Stack, TextArea} from '@earendil-works/elanor-react';

import styles from './composer.module.css';

const models = [
  {value: 'large', label: 'Large model with extended reasoning'},
  {value: 'fast', label: 'Fast model with extended reasoning'},
];

const levels = [
  {value: 'low', label: 'Low'},
  {value: 'high', label: 'High'},
];

export default function ComposerNarrowPolicy() {
  return (
    <Composer.Panel className={styles.narrow}>
      <Composer.Field>
        <TextArea rows={1} aria-label="Message" placeholder="Write a message…" />
        <Composer.Controls className={styles.end}>
          <IconButton density="default" hierarchy="primary" aria-label="Send">
            <ArrowUpwardIcon />
          </IconButton>
        </Composer.Controls>
      </Composer.Field>
      <Composer.Footer>
        <Dropdown.Root items={models} defaultValue="fast">
          <Dropdown.Trigger variant="ghost" density="compact" aria-label="Model">
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
          <Dropdown.Trigger variant="ghost" density="compact" aria-label="Thinking">
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
        <Stack direction="row" gap="medium" className={styles.figures}>
          <Meter.Root value={42} aria-label="Context used" className={styles.meter}>
            <Meter.Track className={styles.track}>
              <Meter.Indicator className={styles.indicator} />
            </Meter.Track>
            <Meter.Value className={styles.meterValue} />
          </Meter.Root>
          <span className={styles.cache}>CH 97%</span>
          <span>$0.84</span>
        </Stack>
      </Composer.Footer>
    </Composer.Panel>
  );
}
