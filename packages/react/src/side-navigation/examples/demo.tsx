import {SideNavigation} from '@earendil-works/elanor-react';

// Demo only; in your code, the links point to real URLs.
export default function SideNavigationDemo() {
  return (
    <SideNavigation.Root aria-label="Workspace">
      <SideNavigation.Group>
        <SideNavigation.GroupLabel>Workspace</SideNavigation.GroupLabel>
        <SideNavigation.List>
          <SideNavigation.Item>
            <SideNavigation.Link href="#" active>
              Projects
            </SideNavigation.Link>
          </SideNavigation.Item>
          <SideNavigation.Item>
            <SideNavigation.Link href="#">Members</SideNavigation.Link>
          </SideNavigation.Item>
          <SideNavigation.Item>
            <SideNavigation.Link href="#">Settings</SideNavigation.Link>
          </SideNavigation.Item>
        </SideNavigation.List>
      </SideNavigation.Group>
    </SideNavigation.Root>
  );
}
