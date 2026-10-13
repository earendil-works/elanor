import {NavigationMenu as BaseNavigationMenu} from '@base-ui/react/navigation-menu';

export {
  NavigationMenuRoot as Root,
  NavigationMenuList as List,
  NavigationMenuItem as Item,
  NavigationMenuLink as Link,
  NavigationMenuTrigger as Trigger,
  NavigationMenuIcon as Icon,
  NavigationMenuContent as Content,
  NavigationMenuPositioner as Positioner,
  NavigationMenuViewport as Viewport,
  NavigationMenuPopup as Popup,
} from './navigation-menu.tsx';

export const Portal = BaseNavigationMenu.Portal;
