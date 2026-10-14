import {Button, Drawer, Stack} from '@earendil-works/elanor-react';

export default function DrawerDemo() {
  return (
    <Drawer.Root>
      <Drawer.Trigger render={<Button hierarchy="secondary" />}>Share project</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop />
        <Drawer.Viewport>
          <Drawer.Popup>
            <Drawer.Content>
              <Stack gap="large" align="stretch">
                <Drawer.Title>Share project</Drawer.Title>
                <Drawer.Description>
                  Anyone with the link can view this project. Swipe down to dismiss.
                </Drawer.Description>
                <Stack direction="row" gap="small">
                  <Drawer.Close render={<Button />}>Copy link</Drawer.Close>
                  <Drawer.Close render={<Button hierarchy="secondary" />}>Cancel</Drawer.Close>
                </Stack>
              </Stack>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
