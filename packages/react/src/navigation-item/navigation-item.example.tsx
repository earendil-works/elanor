import {NavigationItem, Stack} from '@earendil-works/elanor-react';

export function NavigationItemExample(): React.JSX.Element {
  return (
    <nav aria-label="Related components">
      <Stack gap="small">
        <NavigationItem href="/components/navigation-item" active>Navigation item</NavigationItem>
        <NavigationItem href="/components/side-navigation">Side navigation</NavigationItem>
      </Stack>
    </nav>
  );
}
