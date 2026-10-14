import {CloseIcon, MenuIcon} from '@earendil-works/elanor-icons-react';
import {
  Drawer,
  IconButton,
  SideNavigation,
  Stack,
  type DrawerRootActions,
} from '@earendil-works/elanor-react';
import {useRef, useState} from 'react';

const destinations = ['Overview', 'Projects', 'Members', 'Settings'];

export default function DrawerSidePanel() {
  const actionsRef = useRef<DrawerRootActions>(null);
  const [current, setCurrent] = useState('Overview');

  return (
    <Drawer.Root swipeDirection="left" actionsRef={actionsRef}>
      <Drawer.Trigger render={<IconButton aria-label="Open navigation" />}>
        <MenuIcon />
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop />
        <Drawer.Viewport>
          <Drawer.Popup>
            <Drawer.Content>
              <Stack gap="large" align="stretch">
                <Stack direction="row" align="center" gap="auto">
                  <Drawer.Title>Acme workspace</Drawer.Title>
                  <Drawer.Close render={<IconButton aria-label="Close navigation" />}>
                    <CloseIcon />
                  </Drawer.Close>
                </Stack>
                <SideNavigation.Root aria-label="Workspace">
                  <SideNavigation.List>
                    {destinations.map((destination) => (
                      <SideNavigation.Item key={destination}>
                        <SideNavigation.Link
                          href="#"
                          active={destination === current}
                          onClick={(event) => {
                            event.preventDefault();
                            setCurrent(destination);
                            actionsRef.current?.close();
                          }}
                        >
                          {destination}
                        </SideNavigation.Link>
                      </SideNavigation.Item>
                    ))}
                  </SideNavigation.List>
                </SideNavigation.Root>
              </Stack>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
