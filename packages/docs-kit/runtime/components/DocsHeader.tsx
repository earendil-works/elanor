/** @jsxImportSource react */
import {SearchIcon} from '@earendil-works/elanor-icons-react/search';
import {TopNavigation} from '@earendil-works/elanor-react';
import type {ReactNode} from 'react';

import {childrenHtml} from '../content/astro-children.ts';
import {ColorSchemeToggle} from './ColorSchemeToggle.tsx';
import {DocsMenuPanel, type NavigationGroup, type NavigationLink} from './DocsNavigation.tsx';
import {docsSearchId} from './DocsSearch.tsx';

/*
 * The top navigation on Elanor's `TopNavigation`: the identity (the `Identity` slot), the
 * configured links and the repository, the search, the color scheme toggle, and below the wide
 * layout, a menu with the pages.
 */

// Invoker commands, which React renders but its types do not list yet.
declare module 'react' {
  interface ButtonHTMLAttributes<T> {
    commandfor?: string;
    command?: 'show-modal' | 'close' | 'request-close' | (string & {});
  }
}

interface DocsHeaderProps {
  readonly groups: readonly NavigationGroup[];
  readonly links: readonly NavigationLink[];
  /** The current page's address. */
  readonly current: string;
  /** The identity, rendered by Astro. */
  readonly identity?: ReactNode;
}

export function DocsHeader({groups, links, current, identity}: DocsHeaderProps): React.JSX.Element {
  return (
    <TopNavigation.Root className="docs-header">
      <TopNavigation.Identity dangerouslySetInnerHTML={childrenHtml(identity)} />

      {links.length > 0 ? (
        <TopNavigation.Navigation className="docs-header-links">
          <nav aria-label="Links">
            <ul>
              {links.map((link) => (
                <li key={link.href}>
                  <TopNavigation.Link href={link.href} active={link.href === current}>
                    {link.label}
                  </TopNavigation.Link>
                </li>
              ))}
            </ul>
          </nav>
        </TopNavigation.Navigation>
      ) : null}

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
        <ColorSchemeToggle />
        <TopNavigation.StaticMenu defaultPanel="main">
          <TopNavigation.StaticMenuTrigger
            className="docs-header-menu-trigger"
            aria-label="Navigation menu"
          />
          <TopNavigation.StaticMenuPopup className="docs-header-menu" aria-label="Navigation menu">
            <nav aria-label="Documentation">
              <DocsMenuPanel groups={groups} current={current} links={links} />
            </nav>
          </TopNavigation.StaticMenuPopup>
        </TopNavigation.StaticMenu>
      </TopNavigation.Actions>
    </TopNavigation.Root>
  );
}
