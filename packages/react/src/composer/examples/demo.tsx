import {DescriptionIcon} from '@earendil-works/elanor-icons-react';
import {
  Chip,
  Composer,
  Dropdown,
  Meter,
  Stack,
  type ComposerActions,
  type ComposerValue,
} from '@earendil-works/elanor-react';
import {useRef, useState} from 'react';

import styles from './composer.module.css';

const toText = (value: ComposerValue) => Composer.toText(value, (chip) => chip.label);

const models = [
  {value: 'large', label: 'Large model'},
  {value: 'fast', label: 'Fast model'},
];

type Attachment = {id: number; file: File};

export default function ComposerDemo() {
  const [value, setValue] = useState<ComposerValue>([]);
  const [files, setFiles] = useState<Attachment[]>([]);
  const actions = useRef<ComposerActions>(null);
  const added = useRef(0);

  return (
    <Composer.Root
      value={value}
      onValueChange={setValue}
      toText={toText}
      actionsRef={actions}
      onAttach={(picked) => {
        const attached = picked.map((file) => ({id: (added.current += 1), file}));
        setFiles((current) => [...current, ...attached]);
      }}
      onSubmit={(sent) => {
        if (!toText(sent).trim() && files.length === 0) return;
        actions.current?.clearHistory();
        setValue([]);
        setFiles([]);
      }}
    >
      <Composer.Panel>
        <Composer.Field>
          <Composer.Attachments aria-label="Attached files">
            {files.map(({id, file}) => (
              <Chip.Root key={id} render={<li />}>
                <Chip.Icon>
                  <DescriptionIcon />
                </Chip.Icon>
                <Chip.Label>{file.name}</Chip.Label>
                <Chip.Remove
                  aria-label={`Remove ${file.name}`}
                  onClick={() => setFiles((current) => current.filter((item) => item.id !== id))}
                />
              </Chip.Root>
            ))}
          </Composer.Attachments>
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
