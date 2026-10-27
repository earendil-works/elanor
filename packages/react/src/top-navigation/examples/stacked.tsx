import {Link, TopNavigation} from '@earendil-works/elanor-react';

import styles from './stacked.module.css';

export default function TopNavigationStacked() {
  return (
    <TopNavigation.Root className={styles.header}>
      <TopNavigation.Identity>
        <Link href="#">Acme</Link>
      </TopNavigation.Identity>
      <TopNavigation.Actions className={styles.actions}>
        <Link href="#">Sign in</Link>
      </TopNavigation.Actions>
      <TopNavigation.Navigation className={styles.navigation}>
        <nav aria-label="Main" className={styles.links}>
          <TopNavigation.Link href="#">Product</TopNavigation.Link>
          <TopNavigation.Link href="#">Pricing</TopNavigation.Link>
          <TopNavigation.Link href="#" active>
            Docs
          </TopNavigation.Link>
        </nav>
      </TopNavigation.Navigation>
    </TopNavigation.Root>
  );
}
