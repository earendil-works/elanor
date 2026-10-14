import {Button, Menu} from '@earendil-works/elanor-react';

export default function MenuGroups() {
  return (
    <Menu.Root>
      <Menu.Trigger render={<Button hierarchy="secondary" />}>Project actions</Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup>
            <Menu.Group>
              <Menu.GroupLabel>Edit</Menu.GroupLabel>
              <Menu.Item>Rename</Menu.Item>
              <Menu.Item>Duplicate</Menu.Item>
            </Menu.Group>
            <Menu.Separator />
            <Menu.Group>
              <Menu.GroupLabel>Manage</Menu.GroupLabel>
              <Menu.Item>Archive</Menu.Item>
              <Menu.Item>Delete</Menu.Item>
            </Menu.Group>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
