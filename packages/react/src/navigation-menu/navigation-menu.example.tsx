import {NavigationMenu} from './navigation-menu.tsx';

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
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}
