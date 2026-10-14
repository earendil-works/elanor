import {Link, TopNavigation} from '@earendil-works/elanor-react';

import styles from './top-navigation.module.css';

export default function TopNavigationDemo() {
  return (
    <TopNavigation.Root className={styles.header}>
      <TopNavigation.Identity>
        <Link href="#">Acme</Link>
      </TopNavigation.Identity>
      <TopNavigation.Navigation>
        <nav aria-label="Main" className={styles.links}>
          <Link href="#">Product</Link>
          <Link href="#">Pricing</Link>
          <Link href="#">Docs</Link>
        </nav>
      </TopNavigation.Navigation>
      <TopNavigation.Actions>
        <Link href="#">Contact sales</Link>
        <Link href="#">Sign in</Link>
      </TopNavigation.Actions>
    </TopNavigation.Root>
  );
}
