import {useState} from 'react';
import {Button} from '../button/button.tsx';
import {Stack} from '../stack/stack.tsx';
import {Text} from '../text/text.tsx';
import {ContextualMenu} from './contextual-menu.tsx';

export function ContextualMenuExample(): React.JSX.Element {
  const [action, setAction] = useState('No action selected.');

  return (
    <Stack align="start" gap="small">
      <Text role="status">{action}</Text>
      <ContextualMenu.Root>
        <ContextualMenu.Trigger render={<Button hierarchy="secondary" />}>
          Project actions
        </ContextualMenu.Trigger>
        <ContextualMenu.Portal>
          <ContextualMenu.Positioner>
            <ContextualMenu.Popup>
              <ContextualMenu.Item onClick={() => setAction('Selected: Rename project.')}>
                Rename project
              </ContextualMenu.Item>
              <ContextualMenu.Separator />
              <ContextualMenu.Item onClick={() => setAction('Selected: Archive project.')}>
                Archive project
              </ContextualMenu.Item>
            </ContextualMenu.Popup>
          </ContextualMenu.Positioner>
        </ContextualMenu.Portal>
      </ContextualMenu.Root>
    </Stack>
  );
}
