import {Link} from '../link/link.tsx';
import {NavigationMenuExample} from '../navigation-menu/navigation-menu.example.tsx';
import {TopNavigation} from './top-navigation.tsx';

export function TopNavigationExample(): React.JSX.Element {
  return (
    <TopNavigation.Root>
      <TopNavigation.Identity>
        <Link href="/">Elanor</Link>
      </TopNavigation.Identity>
      <TopNavigation.Navigation>
        <NavigationMenuExample />
      </TopNavigation.Navigation>
      <TopNavigation.Actions>
        <Link href="https://github.com/earendil-works/elanor">Source code</Link>
      </TopNavigation.Actions>
    </TopNavigation.Root>
  );
}
