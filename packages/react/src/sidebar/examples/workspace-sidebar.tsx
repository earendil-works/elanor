import {
  ChatIcon,
  DataExplorationIcon,
  GroupsIcon,
  HomeIcon,
  KeyIcon,
  SettingsIcon,
} from '@earendil-works/elanor-icons-react';
import {Link, SideNavigation, Sidebar, Stack} from '@earendil-works/elanor-react';
import {useState, type ReactNode} from 'react';

const groups = [
  {
    label: 'Insights',
    items: [
      {label: 'Explore', icon: <DataExplorationIcon />},
      {label: 'Sessions', icon: <ChatIcon />},
    ],
  },
  {
    label: 'Manage',
    items: [
      {label: 'API keys', icon: <KeyIcon />},
      {label: 'Members', icon: <GroupsIcon />},
      {label: 'Settings', icon: <SettingsIcon />},
    ],
  },
];

/** Sidebar regions shared by the demos. `collapsed` comes from Sidebar.Root. */
export function WorkspaceSidebar({collapsed}: {readonly collapsed: boolean}) {
  const [current, setCurrent] = useState('Home');
  const variant = collapsed ? 'compact' : 'default';

  const link = (label: string, icon: ReactNode) => (
    <SideNavigation.Item key={label}>
      <SideNavigation.Link
        href="#"
        iconStart={icon}
        active={label === current}
        onClick={(event) => {
          event.preventDefault();
          setCurrent(label);
        }}
      >
        {label}
      </SideNavigation.Link>
    </SideNavigation.Item>
  );

  return (
    <>
      <Sidebar.Header>
        <Stack
          direction={collapsed ? 'column' : 'row'}
          gap={collapsed ? 'small' : 'auto'}
          align="center"
          style={{inlineSize: '100%'}}
        >
          <Link href="#" aria-label="Acme workspace">
            {collapsed ? 'A' : 'Acme workspace'}
          </Link>
          <Sidebar.Trigger />
        </Stack>
      </Sidebar.Header>
      <Sidebar.Content>
        <SideNavigation.Root aria-label="Workspace" variant={variant}>
          <SideNavigation.List>{link('Home', <HomeIcon />)}</SideNavigation.List>
          {groups.map((group) => (
            <SideNavigation.Group key={group.label}>
              <SideNavigation.GroupLabel>{group.label}</SideNavigation.GroupLabel>
              <SideNavigation.List>
                {group.items.map((item) => link(item.label, item.icon))}
              </SideNavigation.List>
            </SideNavigation.Group>
          ))}
        </SideNavigation.Root>
      </Sidebar.Content>
      <Sidebar.Footer>
        <SideNavigation.Root aria-label="Account" variant={variant}>
          <SideNavigation.List>
            <SideNavigation.Item>
              <SideNavigation.Link href="#" compactContent="AM">
                Alex Morgan
              </SideNavigation.Link>
            </SideNavigation.Item>
          </SideNavigation.List>
        </SideNavigation.Root>
      </Sidebar.Footer>
    </>
  );
}
