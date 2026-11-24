import {SearchIcon} from '@earendil-works/elanor-icons-react';
import {Link, TopNavigation} from '@earendil-works/elanor-react';

import styles from './top-navigation.module.css';

export default function TopNavigationDemo() {
  return (
    <TopNavigation.Root>
      <TopNavigation.Identity>
        <Link href="#">Acme</Link>
      </TopNavigation.Identity>
      <TopNavigation.Navigation>
        <nav aria-label="Main" className={styles.links}>
          <TopNavigation.Link href="#">Product</TopNavigation.Link>
          <TopNavigation.Link href="#">Pricing</TopNavigation.Link>
          <TopNavigation.Link href="#" active>
            Docs
          </TopNavigation.Link>
        </nav>
      </TopNavigation.Navigation>
      <TopNavigation.Actions>
        <TopNavigation.ActionButton aria-label="Search">
          <SearchIcon aria-hidden />
        </TopNavigation.ActionButton>
        <Link href="#">Sign in</Link>
      </TopNavigation.Actions>
    </TopNavigation.Root>
  );
}
