import {Dropdown} from './dropdown.tsx';

export function DropdownExample(): React.JSX.Element {
  return (
    <Dropdown.Root>
      <Dropdown.Trigger>
        <Dropdown.Value placeholder="Select a project" />
        <Dropdown.Icon />
      </Dropdown.Trigger>
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
