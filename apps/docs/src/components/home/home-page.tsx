import {PauseIcon, PlayArrowIcon, ReplayIcon} from '@earendil-works/elanor-icons-boiled-react';
import {IconButton, Layout} from '@earendil-works/elanor-react';
import type {ReactNode} from 'react';

import type {SiteMark} from '../../lib/site-mark.ts';
import {ColorSchemeToggle} from '../color-scheme-toggle.tsx';
import {SiteIdentity} from '../site-identity.tsx';

import styles from './home-page.module.css';

interface HomePageProps {
  readonly mark: SiteMark;
  readonly children: ReactNode;
}

/** Static HTML: the garden scripts wire replay and pause, the color scheme script the toggle. */
export function HomePage({mark, children}: HomePageProps): React.JSX.Element {
  return (
    <Layout.Root className={`${styles.home} garden-page`}>
      <Layout.Header className={styles.header}>
        <SiteIdentity mark={mark} />
        <div className={styles.actions}>
          {/* Shown by the garden scripts; motion controls are hidden with reduced motion. */}
          <IconButton
            aria-label="Replay intro"
            className={styles.motion}
            data-replay-intro=""
            hidden
          >
            <ReplayIcon />
          </IconButton>
          <IconButton
            aria-label="Pause animations"
            aria-pressed="false"
            className={styles.motion}
            data-garden-pause=""
            hidden
          >
            <PauseIcon className={styles.pauseIcon} />
            <PlayArrowIcon className={styles.playIcon} />
          </IconButton>
          <ColorSchemeToggle />
        </div>
      </Layout.Header>
      <Layout.Main className={styles.main}>
        <h1 className="visually-hidden">Elanor design system</h1>
        {children}
      </Layout.Main>
    </Layout.Root>
  );
}
