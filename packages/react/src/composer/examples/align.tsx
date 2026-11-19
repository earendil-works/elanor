import {AddIcon, ArrowUpwardIcon} from '@earendil-works/elanor-icons-react';
import {Composer, Dropdown, IconButton, Stack, Text, TextArea} from '@earendil-works/elanor-react';

import styles from './composer.module.css';

const models = [
  {value: 'large', label: 'Large model'},
  {value: 'fast', label: 'Fast model'},
];

export default function ComposerAlign() {
  return (
    <Stack gap="small" align="stretch">
      <Text>A message in the conversation above.</Text>
      <Composer.Panel className={styles.textAligned}>
        <Composer.Field>
          <TextArea rows={1} aria-label="Message" placeholder="Write a message…" />
          <Composer.Controls render={<Stack direction="row" gap="auto" align="center" />}>
            <IconButton density="default" aria-label="Attach files">
              <AddIcon />
            </IconButton>
            <Stack direction="row" gap="xSmall" align="center">
              <IconButton density="default" hierarchy="primary" aria-label="Send">
                <ArrowUpwardIcon />
              </IconButton>
            </Stack>
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
            <span>$0.84</span>
          </Stack>
        </Composer.Footer>
      </Composer.Panel>
    </Stack>
  );
}
