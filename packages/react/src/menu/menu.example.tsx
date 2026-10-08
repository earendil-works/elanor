import {useState} from 'react';
import {Button} from '../button/button.tsx';
import {Stack} from '../stack/stack.tsx';
import {Text} from '../text/text.tsx';
import {Menu} from './index.ts';

export function MenuExample(): React.JSX.Element {
  const [action, setAction] = useState('No action selected.');

  return (
    <Stack align="start" gap="small">
      <Text role="status">{action}</Text>
      <Menu.Root>
        <Menu.Trigger render={<Button hierarchy="secondary" />}>
          Project actions
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item onClick={() => setAction('Selected: Rename project.')}>
                Rename project
              </Menu.Item>
              <Menu.Separator />
              <Menu.Item onClick={() => setAction('Selected: Archive project.')}>
                Archive project
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </Stack>
  );
}
