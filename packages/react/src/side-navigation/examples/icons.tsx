import {FolderOpenIcon, GroupIcon, SettingsIcon} from '@earendil-works/elanor-icons-react';
import {SideNavigation} from '@earendil-works/elanor-react';

export default function SideNavigationIcons() {
  return (
    <SideNavigation.Root aria-label="Workspace">
      <SideNavigation.List>
        <SideNavigation.Item>
          <SideNavigation.Link href="#" active iconStart={<FolderOpenIcon />}>
            Projects
          </SideNavigation.Link>
        </SideNavigation.Item>
        <SideNavigation.Item>
          <SideNavigation.Link href="#" iconStart={<GroupIcon />}>
            Members
          </SideNavigation.Link>
        </SideNavigation.Item>
        <SideNavigation.Item>
          <SideNavigation.Link href="#" iconStart={<SettingsIcon />}>
            Settings
          </SideNavigation.Link>
        </SideNavigation.Item>
      </SideNavigation.List>
    </SideNavigation.Root>
  );
}
