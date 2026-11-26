import {UploadIcon} from '@earendil-works/elanor-icons-react';
import {
  Chip,
  Composer,
  Dropdown,
  Meter,
  Stack,
  type ComposerActions,
  type ComposerChip,
  type ComposerValue,
} from '@earendil-works/elanor-react';
import {useRef, useState} from 'react';

import styles from './composer.module.css';

const toText = (value: ComposerValue) => Composer.toText(value, (chip) => `@uploads:${chip.label}`);

let uploads = 0;

// Outside the component: a new function on every render would draw every chip again.
const renderChip = (chip: ComposerChip) => (
  <Chip.Root variant="soft" density="compact">
    <Chip.Icon>
      <UploadIcon />
    </Chip.Icon>
    <Chip.Label>Upload</Chip.Label>
    <Chip.Separator />
    <Chip.Label>{chip.label}</Chip.Label>
  </Chip.Root>
);

const models = [
  {value: 'large', label: 'Large model'},
  {value: 'fast', label: 'Fast model'},
];

export default function ComposerDemo() {
  const [value, setValue] = useState<ComposerValue>([]);
  const actions = useRef<ComposerActions>(null);

  return (
    <Composer.Root
      value={value}
      onValueChange={setValue}
      toText={toText}
      actionsRef={actions}
      onAttach={(files) =>
        actions.current?.insert(
          files.flatMap((file) => [{id: `upload-${(uploads += 1)}`, label: file.name}, ' ']),
        )
      }
      renderChip={renderChip}
      onSubmit={(sent) => {
        if (!toText(sent).trim()) return;
        actions.current?.clearHistory();
        setValue([]);
      }}
    >
      <Composer.Panel>
        <Composer.Field>
          <Composer.Prompt aria-label="Message" placeholder="Write a message…" />
          <Composer.Controls render={<Stack direction="row" gap="auto" align="center" />}>
            <Composer.Attach aria-label="Attach files" />
            <Composer.Submit />
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
          <Stack direction="row" gap="medium" className={styles.figures}>
            <Meter.Root value={42} aria-label="Context used" className={styles.meter}>
              <Meter.Track className={styles.track}>
                <Meter.Indicator className={styles.indicator} />
              </Meter.Track>
              <Meter.Value className={styles.meterValue} />
            </Meter.Root>
            <span>$0.84</span>
          </Stack>
        </Composer.Footer>
      </Composer.Panel>
    </Composer.Root>
  );
}
