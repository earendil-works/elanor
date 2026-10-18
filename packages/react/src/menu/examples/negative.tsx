import {Button, Menu} from '@earendil-works/elanor-react';

export default function MenuNegative() {
  return (
    <Menu.Root>
      <Menu.Trigger render={<Button hierarchy="secondary" />}>Project actions</Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup>
            <Menu.Item>Rename</Menu.Item>
            <Menu.Item>Duplicate</Menu.Item>
            <Menu.Separator />
            <Menu.Item semantic="negative">Delete project</Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
