import {ContextMenu, Stack, Text} from '@earendil-works/elanor-react';
import {useState} from 'react';

import styles from './context-menu.module.css';

export default function ContextMenuDemo() {
  const [action, setAction] = useState('No action selected.');

  return (
    <Stack gap="small">
      <ContextMenu.Root>
        <ContextMenu.Trigger className={styles.area}>
          Right-click or long-press here
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Positioner>
            <ContextMenu.Popup>
              <ContextMenu.Item onClick={() => setAction('Selected: Rename.')}>
                Rename
              </ContextMenu.Item>
              <ContextMenu.Item onClick={() => setAction('Selected: Duplicate.')}>
                Duplicate
              </ContextMenu.Item>
              <ContextMenu.Item onClick={() => setAction('Selected: Archive.')}>
                Archive
              </ContextMenu.Item>
            </ContextMenu.Popup>
          </ContextMenu.Positioner>
        </ContextMenu.Portal>
      </ContextMenu.Root>
      <Text role="status">{action}</Text>
    </Stack>
  );
}
