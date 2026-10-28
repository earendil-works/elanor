import {SearchIcon} from '@earendil-works/elanor-icons-boiled-react';
import {TopNavigation} from '@earendil-works/elanor-react';

import type {DocsNavigationGroup} from '../lib/docs-navigation.ts';
import type {SiteMark} from '../lib/site-mark.ts';
import {ColorSchemeToggle} from './color-scheme-toggle.tsx';
import {DocsMenuNavigation} from './docs-navigation.tsx';
import {docsSearchId} from './docs-search.tsx';
import {SiteIdentity} from './site-identity.tsx';

/*
 * The docs' top navigation on narrow screens, where the side navigation leaves: Elanor's
 * `TopNavigation` with the identity, the color scheme toggle, a search button, and the static menu
 * with the documentation navigation. Wide screens have no top navigation.
 */

interface DocsHeaderProps {
  readonly groups: readonly DocsNavigationGroup[];
  /** The current page's path. */
  readonly current: string;
  readonly mark: SiteMark;
}

// Invoker commands, which React renders but its types do not list yet.
declare module 'react' {
  interface ButtonHTMLAttributes<T> {
    commandfor?: string;
    command?: 'show-modal' | 'close' | 'request-close' | (string & {});
  }
}

export function DocsHeader({groups, current, mark}: DocsHeaderProps): React.JSX.Element {
  return (
    <TopNavigation.Root className="docs-header">
      <TopNavigation.Identity>
        {/* Full load: the homepage doesn't use the client router. */}
        <SiteIdentity mark={mark} data-astro-reload />
      </TopNavigation.Identity>
      <TopNavigation.Actions>
        <ColorSchemeToggle variant="top-navigation" />
        <TopNavigation.ActionButton
          commandfor={docsSearchId}
          command="show-modal"
          aria-haspopup="dialog"
          aria-label="Search documentation"
          title="Search documentation"
        >
          <SearchIcon />
        </TopNavigation.ActionButton>
        <TopNavigation.StaticMenu defaultPanel="main">
          <TopNavigation.StaticMenuTrigger aria-label="Navigation menu" />
          <TopNavigation.StaticMenuPopup aria-label="Navigation menu">
            <nav aria-label="Documentation">
              <TopNavigation.StaticMenuPanel panel="main">
                <DocsMenuNavigation groups={groups} current={current} />
              </TopNavigation.StaticMenuPanel>
            </nav>
          </TopNavigation.StaticMenuPopup>
        </TopNavigation.StaticMenu>
      </TopNavigation.Actions>
    </TopNavigation.Root>
  );
}
