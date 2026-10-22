import {ReplayIcon} from '@earendil-works/elanor-icons-boiled-react';
import {Button, Layout, Link} from '@earendil-works/elanor-react';
import type {ReactNode} from 'react';

import {ColorSchemeToggle} from '../color-scheme-toggle.tsx';

import styles from './home-page.module.css';

export interface HomePageMark {
  readonly src: string;
  readonly srcSet: string;
  readonly width: number;
  readonly height: number;
}

interface HomePageProps {
  /** The flower, shown beside the wordmark. */
  readonly mark: HomePageMark;
  /** The garden navigation. */
  readonly children: ReactNode;
}

/**
 * Homepage frame around the garden. Rendered to static HTML; the garden scripts reveal
 * and wire the replay button, and the color scheme script handles the toggle.
 */
export function HomePage({mark, children}: HomePageProps): React.JSX.Element {
  return (
    <Layout.Root className={`${styles.home} garden-page`}>
      <Link href="#main" className={styles.skipLink}>
        Skip to content
      </Link>
      <Layout.Header className={styles.header}>
        <Link href="/" aria-label="Elanor home" className={styles.identity}>
          <img
            className={styles.mark}
            src={mark.src}
            srcSet={mark.srcSet}
            width={mark.width}
            height={mark.height}
            alt=""
          />
          <span>Elanor</span>
        </Link>
        <ColorSchemeToggle />
      </Layout.Header>
      <Layout.Main id="main" tabIndex={-1} className={styles.main}>
        <h1 className={styles.title}>Elanor design system</h1>
        {children}
      </Layout.Main>
      <Button
        hierarchy="tertiary"
        density="compact"
        iconEnd={<ReplayIcon />}
        className={styles.replay}
        data-replay-intro=""
        hidden
      >
        Replay intro
      </Button>
    </Layout.Root>
  );
}
