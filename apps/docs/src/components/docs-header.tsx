import {SearchIcon} from '@earendil-works/elanor-icons-boiled-react';
import {TopNavigation} from '@earendil-works/elanor-react';

import {hasSideNavigation, type DocsSiteSection} from '../lib/docs-navigation.ts';
import type {SiteMark} from '../lib/site-mark.ts';
import {ColorSchemeToggle} from './color-scheme-toggle.tsx';
import {DocsMenuPanels} from './docs-navigation.tsx';
import {docsSearchId} from './docs-search.tsx';
import {SiteIdentity} from './site-identity.tsx';

/*
 * The docs' top navigation on Elanor's `TopNavigation`, like pi.dev's: the identity, a link to
 * each section of the site, and the color scheme toggle. Below the wide layout, the links move into
 * the static menu, with each section's pages. The search button opens the search of all sections.
 */

interface DocsHeaderProps {
  readonly sections: readonly DocsSiteSection[];
  /** The current page's path. */
  readonly current: string;
  /** The current page's section. */
  readonly currentSection: DocsSiteSection | undefined;
  readonly mark: SiteMark;
}

// Invoker commands, which React renders but its types do not list yet.
declare module 'react' {
  interface ButtonHTMLAttributes<T> {
    commandfor?: string;
    command?: 'show-modal' | 'close' | 'request-close' | (string & {});
  }
}

export function DocsHeader({
  sections,
  current,
  currentSection,
  mark,
}: DocsHeaderProps): React.JSX.Element {
  return (
    <TopNavigation.Root className="docs-header">
      <TopNavigation.Identity>
        {/* Full load: the homepage doesn't use the client router. */}
        <SiteIdentity mark={mark} data-astro-reload />
      </TopNavigation.Identity>

      <TopNavigation.Navigation className="docs-header-sections">
        <nav aria-label="Sections">
          <ul>
            {sections.map((section) => (
              <li key={section.id}>
                <TopNavigation.Link href={section.href} active={section.id === currentSection?.id}>
                  {section.label}
                </TopNavigation.Link>
              </li>
            ))}
          </ul>
        </nav>
      </TopNavigation.Navigation>

      <TopNavigation.Actions className="docs-header-actions">
        <TopNavigation.ActionButton
          commandfor={docsSearchId}
          command="show-modal"
          aria-haspopup="dialog"
          aria-label="Search documentation"
          title="Search documentation"
        >
          <SearchIcon />
        </TopNavigation.ActionButton>
        <ColorSchemeToggle variant="top-navigation" />
        <TopNavigation.StaticMenu
          defaultPanel={hasSideNavigation(currentSection) ? currentSection.id : 'main'}
        >
          <TopNavigation.StaticMenuTrigger
            className="docs-header-menu-trigger"
            aria-label="Navigation menu"
          />
          <TopNavigation.StaticMenuPopup className="docs-header-menu" aria-label="Navigation menu">
            <nav aria-label="Documentation">
              <DocsMenuPanels
                sections={sections}
                current={current}
                currentSection={currentSection}
              />
            </nav>
          </TopNavigation.StaticMenuPopup>
        </TopNavigation.StaticMenu>
      </TopNavigation.Actions>
    </TopNavigation.Root>
  );
}
