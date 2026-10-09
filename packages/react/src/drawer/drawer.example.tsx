import {CloseIcon} from '@earendil-works/elanor-icons-react';
import {
  Button,
  IconButton,
  SideNavigation,
  Stack,
  Drawer,
  type DrawerRootActions,
} from '@earendil-works/elanor-react';
import {useRef} from 'react';

export function DrawerExample(): React.JSX.Element {
  const actionsRef = useRef<DrawerRootActions>(null);

  return (
    <Drawer.Root swipeDirection="left" actionsRef={actionsRef}>
      <Drawer.Trigger render={<Button hierarchy="secondary" />}>Open navigation</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop />
        <Drawer.Viewport>
          <Drawer.Popup>
            <Drawer.Content>
              <Stack gap="large" align="stretch">
                <Stack direction="row" align="center" gap="auto">
                  <Drawer.Title>Explore Elanor</Drawer.Title>
                  <Drawer.Close render={<IconButton aria-label="Close navigation" />}>
                    <CloseIcon />
                  </Drawer.Close>
                </Stack>
                <Drawer.Description>
                  Choose a destination, or swipe left to dismiss.
                </Drawer.Description>
                <SideNavigation.Root aria-label="Example navigation">
                  <SideNavigation.List>
                    {[
                      {href: '/components/layout/', label: 'Layout'},
                      {href: '/components/sidebar/', label: 'Sidebar'},
                      {href: '/components/top-navigation/', label: 'Top navigation'},
                    ].map(({href, label}) => (
                      <SideNavigation.Item key={href}>
                        <SideNavigation.Link
                          href={href}
                          onClick={() => actionsRef.current?.close()}
                        >
                          {label}
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
