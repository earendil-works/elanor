import {SideNavigation} from '@earendil-works/elanor-react';

export default function SideNavigationSections() {
  return (
    <SideNavigation.Root aria-label="Help center">
      <SideNavigation.List>
        <SideNavigation.Item>
          <SideNavigation.Link href="#">Introduction</SideNavigation.Link>
        </SideNavigation.Item>
        <SideNavigation.Item>
          <SideNavigation.Collapsible open>
            <SideNavigation.CollapsibleTrigger>Guides</SideNavigation.CollapsibleTrigger>
            <SideNavigation.List>
              <SideNavigation.Item>
                <SideNavigation.Link href="#">Getting started</SideNavigation.Link>
              </SideNavigation.Item>
              <SideNavigation.Item>
                <SideNavigation.Link href="#" active>
                  Deploying a project
                </SideNavigation.Link>
              </SideNavigation.Item>
            </SideNavigation.List>
          </SideNavigation.Collapsible>
        </SideNavigation.Item>
        <SideNavigation.Item>
          <SideNavigation.Collapsible>
            <SideNavigation.CollapsibleTrigger>Reference</SideNavigation.CollapsibleTrigger>
            <SideNavigation.List>
              <SideNavigation.Item>
                <SideNavigation.Link href="#">Command-line tool</SideNavigation.Link>
              </SideNavigation.Item>
              <SideNavigation.Item>
                <SideNavigation.Link href="#">Configuration file</SideNavigation.Link>
              </SideNavigation.Item>
            </SideNavigation.List>
          </SideNavigation.Collapsible>
        </SideNavigation.Item>
      </SideNavigation.List>
    </SideNavigation.Root>
  );
}
