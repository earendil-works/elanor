import {Stack, NavigationMenu} from '@earendil-works/elanor-react';

export function NavigationMenuExample(): React.JSX.Element {
  return (
    <NavigationMenu.Root aria-label="Related components">
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/components/tabs/">Tabs</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/components/menu/">Menu</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>
            More
            <NavigationMenu.Icon />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <Stack gap="xxSmall">
              <NavigationMenu.Link href="/components/modal/">Modal</NavigationMenu.Link>
              <NavigationMenu.Link href="/components/popover/">Popover</NavigationMenu.Link>
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
