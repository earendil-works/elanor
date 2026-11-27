import {Dropdown, Meter, Stack} from '@earendil-works/elanor-react';

import styles from '../composer.module.css';

const models = [
  {value: 'large', label: 'Large model'},
  {value: 'fast', label: 'Fast model'},
];

/** A ghost trigger: its hover fill reaches past the frame's text inset. */
export function ModelPicker() {
  return (
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
  );
}

/** The context used and the cost so far, at the footer's end. */
export function Figures() {
  return (
    <Stack direction="row" gap="medium" className={styles.figures}>
      <Meter.Root value={42} aria-label="Context used" className={styles.meter}>
        <Meter.Track className={styles.track}>
          <Meter.Indicator className={styles.indicator} />
        </Meter.Track>
        <Meter.Value className={styles.meterValue} />
      </Meter.Root>
      <span>$0.84</span>
    </Stack>
  );
}
