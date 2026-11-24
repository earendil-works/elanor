import {ContentCopyIcon, EditIcon, OpenInNewIcon} from '@earendil-works/elanor-icons-react';
import {Button, Menu} from '@earendil-works/elanor-react';

// Demo only; in your code, the links point to real URLs.
export default function MenuIcons() {
  return (
    <Menu.Root>
      <Menu.Trigger render={<Button hierarchy="secondary" />}>Project actions</Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup>
            <Menu.Item icon={<EditIcon />}>Rename</Menu.Item>
            <Menu.Item icon={<ContentCopyIcon />}>Duplicate</Menu.Item>
            <Menu.LinkItem href="#" endAdornment={<OpenInNewIcon />}>
              Open in new tab
            </Menu.LinkItem>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
