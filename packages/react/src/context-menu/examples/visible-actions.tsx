import {EditIcon, ContentCopyIcon, MoreHorizIcon} from '@earendil-works/elanor-icons-react';
import {ContextMenu, IconButton, Menu, Stack, Text} from '@earendil-works/elanor-react';

import styles from './context-menu.module.css';

function ProjectActions() {
  return (
    <>
      <Menu.Item icon={<EditIcon />}>Rename</Menu.Item>
      <Menu.Item icon={<ContentCopyIcon />}>Duplicate</Menu.Item>
    </>
  );
}

export default function ContextMenuVisibleActions() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger
        render={<Stack direction="row" align="center" gap="xSmall" className={styles.row} />}
      >
        <Text className={styles.name}>Website redesign</Text>
        <Menu.Root>
          <Menu.Trigger render={<IconButton aria-label="Actions for Website redesign" />}>
            <MoreHorizIcon />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner align="end">
              <Menu.Popup>
                <ProjectActions />
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Positioner>
          <ContextMenu.Popup>
            <ProjectActions />
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
