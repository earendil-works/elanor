import {Link, TopNavigation} from '@earendil-works/elanor-react';

import styles from './top-navigation.example.module.css';

function Links(): React.JSX.Element {
  return (
    <nav aria-label="Example links" className={styles.links}>
      <Link href="/components/layout/">Layout</Link>
      <Link href="/components/sidebar/">Sidebar</Link>
      <Link href="/components/drawer/">Drawer</Link>
    </nav>
  );
}

export function TopNavigationExample(): React.JSX.Element {
  return (
    <TopNavigation.Root className={styles.header}>
      <TopNavigation.Identity>
        <Link href="/">Elanor</Link>
      </TopNavigation.Identity>
      <TopNavigation.Navigation>
        <Links />
      </TopNavigation.Navigation>
      <TopNavigation.Actions>
        <Link href="https://github.com/earendil-works/elanor">Source code</Link>
      </TopNavigation.Actions>
    </TopNavigation.Root>
  );
}

export function CenteredTopNavigationExample(): React.JSX.Element {
  return (
    <div className={styles.frame}>
      <TopNavigation.Root className={styles.centered}>
        <TopNavigation.Identity>
          <Link href="/">Elanor</Link>
        </TopNavigation.Identity>
        <TopNavigation.Navigation className={styles.centeredLinks}>
          <Links />
        </TopNavigation.Navigation>
        <TopNavigation.Actions className={styles.end}>
          <Link href="https://github.com/earendil-works/elanor">Source code</Link>
        </TopNavigation.Actions>
      </TopNavigation.Root>
    </div>
  );
}

export function StackedTopNavigationExample(): React.JSX.Element {
  return (
    <TopNavigation.Root className={styles.stacked}>
      <TopNavigation.Identity>
        <Link href="/">Elanor</Link>
      </TopNavigation.Identity>
      <TopNavigation.Actions className={styles.end}>
        <Link href="https://github.com/earendil-works/elanor">Source code</Link>
      </TopNavigation.Actions>
      <TopNavigation.Navigation className={styles.fullRow}>
        <Links />
      </TopNavigation.Navigation>
    </TopNavigation.Root>
  );
}
