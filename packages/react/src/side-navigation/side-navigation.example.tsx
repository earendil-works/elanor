import {SideNavigation} from '@earendil-works/elanor-react';

export function SideNavigationExample(): React.JSX.Element {
  return (
    <SideNavigation.Root aria-label="Related components">
      <SideNavigation.Group>
        <SideNavigation.GroupLabel>Navigation</SideNavigation.GroupLabel>
        <SideNavigation.List>
          <SideNavigation.Item>
            <SideNavigation.Link href="/components/side-navigation" active>Side navigation</SideNavigation.Link>
          </SideNavigation.Item>
          <SideNavigation.Item>
            <SideNavigation.Link href="/components/tabs">Tabs</SideNavigation.Link>
          </SideNavigation.Item>
        </SideNavigation.List>
      </SideNavigation.Group>
    </SideNavigation.Root>
  );
}
