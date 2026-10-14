import {NavigationMenu, Stack} from '@earendil-works/elanor-react';

export default function NavigationMenuSubmenu() {
  return (
    <NavigationMenu.Root aria-label="Main">
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="#" active>
            Overview
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>
            Resources
            <NavigationMenu.Icon />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <Stack gap="xxSmall">
              <NavigationMenu.Link href="#">Guides</NavigationMenu.Link>
              <NavigationMenu.Link href="#">Changelog</NavigationMenu.Link>
              <NavigationMenu.Link href="#">Support</NavigationMenu.Link>
            </Stack>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>
      <NavigationMenu.Portal>
        <NavigationMenu.Positioner align="start">
          <NavigationMenu.Popup>
            <NavigationMenu.Viewport />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}
