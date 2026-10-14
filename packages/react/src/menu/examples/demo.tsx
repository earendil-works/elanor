import {Button, Menu, Stack, Text} from '@earendil-works/elanor-react';
import {useState} from 'react';

export default function MenuDemo() {
  const [action, setAction] = useState('No action selected.');

  return (
    <Stack gap="small">
      <Menu.Root>
        <Menu.Trigger render={<Button hierarchy="secondary" />}>Project actions</Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item onClick={() => setAction('Selected: Rename.')}>Rename</Menu.Item>
              <Menu.Item onClick={() => setAction('Selected: Duplicate.')}>Duplicate</Menu.Item>
              <Menu.Item onClick={() => setAction('Selected: Archive.')}>Archive</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
      <Text role="status">{action}</Text>
    </Stack>
  );
}
