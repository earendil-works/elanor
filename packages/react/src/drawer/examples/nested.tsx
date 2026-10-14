import {Button, Drawer, Stack} from '@earendil-works/elanor-react';

export default function DrawerNested() {
  return (
    <Drawer.Root>
      <Drawer.Trigger render={<Button hierarchy="secondary" />}>Project settings</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop />
        <Drawer.Viewport>
          <Drawer.Popup data-stacked>
            <Drawer.Content>
              <Stack gap="large" align="stretch">
                <Drawer.Title>Project settings</Drawer.Title>
                <Drawer.Description>Open sharing settings in a nested sheet.</Drawer.Description>
                <Drawer.Root>
                  <Drawer.Trigger render={<Button />}>Sharing settings</Drawer.Trigger>
                  <Drawer.Portal>
                    <Drawer.Backdrop />
                    <Drawer.Viewport>
                      <Drawer.Popup data-stacked>
                        <Drawer.Content>
                          <Stack gap="large" align="stretch">
                            <Drawer.Title>Sharing settings</Drawer.Title>
                            <Drawer.Description>
                              Swipe down or close this sheet to return to project settings.
                            </Drawer.Description>
                            <Drawer.Close render={<Button />}>Back</Drawer.Close>
                          </Stack>
                        </Drawer.Content>
                      </Drawer.Popup>
                    </Drawer.Viewport>
                  </Drawer.Portal>
                </Drawer.Root>
                <Drawer.Close render={<Button hierarchy="secondary" />}>Close</Drawer.Close>
              </Stack>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
