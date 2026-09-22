import {Stack} from '../stack/stack.tsx';
import {Dropdown} from './dropdown.tsx';

export function DropdownExample(): React.JSX.Element {
  return (
    <Dropdown.Root>
      <Stack gap="small">
        <Dropdown.Label>Project</Dropdown.Label>
        <Dropdown.Trigger>
          <Dropdown.Value placeholder="Select a project" />
          <Dropdown.Icon />
        </Dropdown.Trigger>
      </Stack>
      <Dropdown.Portal>
        <Dropdown.Positioner>
          <Dropdown.Popup>
            <Dropdown.List>
              <Dropdown.Item value="alpha">Alpha</Dropdown.Item>
              <Dropdown.Item value="beta">Beta</Dropdown.Item>
            </Dropdown.List>
          </Dropdown.Popup>
        </Dropdown.Positioner>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}
