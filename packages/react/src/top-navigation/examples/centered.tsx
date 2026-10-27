import {Link, TopNavigation} from '@earendil-works/elanor-react';

import styles from './centered.module.css';

export default function TopNavigationCentered() {
  return (
    <div className={styles.frame}>
      <TopNavigation.Root className={styles.header}>
        <TopNavigation.Identity>
          <Link href="#">Acme</Link>
        </TopNavigation.Identity>
        <TopNavigation.Navigation className={styles.navigation}>
          <nav aria-label="Main" className={styles.links}>
            <TopNavigation.Link href="#">Product</TopNavigation.Link>
            <TopNavigation.Link href="#">Pricing</TopNavigation.Link>
            <TopNavigation.Link href="#" active>
              Docs
            </TopNavigation.Link>
          </nav>
        </TopNavigation.Navigation>
        <TopNavigation.Actions className={styles.actions}>
          <Link href="#">Contact sales</Link>
          <Link href="#">Sign in</Link>
        </TopNavigation.Actions>
      </TopNavigation.Root>
    </div>
  );
}
