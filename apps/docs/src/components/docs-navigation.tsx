import {ScrollArea, Separator, SideNavigation, TopNavigation} from '@earendil-works/elanor-react';

import type {DocsNavigationGroup, DocsNavigationItem} from '../lib/docs-navigation.ts';
import type {SiteMark} from '../lib/site-mark.ts';
import {ColorSchemeToggle} from './color-scheme-toggle.tsx';
import {DocsSearchTrigger} from './docs-search.tsx';
import {SiteIdentity} from './site-identity.tsx';

/*
 * The documentation navigation on Elanor's static parts, rendered twice from the same data: as the
 * side navigation on wide screens, and in the top navigation's menu on narrow ones.
 * `scripts/navigation-behaviors.ts` makes both work before the first paint.
 */

interface DocsNavigationProps {
  readonly groups: readonly DocsNavigationGroup[];
  /** The current page's path. */
  readonly current: string;
}

const containsCurrent = (item: DocsNavigationItem, current: string) =>
  item.type === 'section' && item.links.some((link) => link.href === current);

/**
 * The side navigation with the identity, the color scheme toggle, and the search above it, all
 * fixed beside the content.
 */
export function DocsSideNavigation({
  groups,
  current,
  mark,
}: DocsNavigationProps & {readonly mark: SiteMark}): React.JSX.Element {
  return (
    <div className="docs-navigation">
      <div className="docs-navigation-header">
        <div className="docs-navigation-identity">
          {/* Full load: the homepage doesn't use the client router. */}
          <SiteIdentity mark={mark} data-astro-reload />
          <ColorSchemeToggle />
        </div>
        <DocsSearchTrigger />
        <Separator />
      </div>
      <ScrollArea.StaticRoot className="docs-navigation-scroll-area">
        <ScrollArea.StaticViewport className="docs-navigation-viewport">
          <ScrollArea.StaticContent className="docs-navigation-content">
            <SideNavigation.StaticRoot aria-label="Documentation" persist="docs">
              {groups.map((group, index) => (
                <SideNavigation.Group key={group.label}>
                  <SideNavigation.GroupLabel id={`docs-navigation-group-${index}`}>
                    {group.label}
                  </SideNavigation.GroupLabel>
                  <SideNavigation.List aria-labelledby={`docs-navigation-group-${index}`}>
                    {group.items.map((item) =>
                      item.type === 'link' ? (
                        <SideNavigation.Item key={item.href}>
                          <SideNavigation.Link href={item.href} active={item.href === current}>
                            {item.label}
                          </SideNavigation.Link>
                        </SideNavigation.Item>
                      ) : (
                        <SideNavigation.Item key={item.id}>
                          <SideNavigation.StaticCollapsible
                            defaultOpen={containsCurrent(item, current)}
                            persist={item.id}
                          >
                            <SideNavigation.StaticCollapsibleTrigger>
                              {item.label}
                            </SideNavigation.StaticCollapsibleTrigger>
                            <SideNavigation.StaticCollapsiblePanel hiddenUntilFound>
                              <SideNavigation.List>
                                {item.links.map((link) => (
                                  <SideNavigation.Item key={link.href}>
                                    <SideNavigation.Link
                                      href={link.href}
                                      active={link.href === current}
                                    >
                                      {link.label}
                                    </SideNavigation.Link>
                                  </SideNavigation.Item>
                                ))}
                              </SideNavigation.List>
                            </SideNavigation.StaticCollapsiblePanel>
                          </SideNavigation.StaticCollapsible>
                        </SideNavigation.Item>
                      ),
                    )}
                  </SideNavigation.List>
                </SideNavigation.Group>
              ))}
            </SideNavigation.StaticRoot>
          </ScrollArea.StaticContent>
        </ScrollArea.StaticViewport>
        <ScrollArea.StaticScrollbar className="docs-navigation-scrollbar">
          <ScrollArea.StaticThumb />
        </ScrollArea.StaticScrollbar>
      </ScrollArea.StaticRoot>
    </div>
  );
}

/** The menu's content: each group's label, then its pages and sections. */
export function DocsMenuNavigation({groups, current}: DocsNavigationProps): React.JSX.Element {
  return (
    <>
      {groups.map((group) => (
        <TopNavigation.MenuGroup key={group.label}>
          <TopNavigation.MenuGroupLabel>{group.label}</TopNavigation.MenuGroupLabel>
          <TopNavigation.MenuList>
            {group.items.map((item) =>
              item.type === 'link' ? (
                <TopNavigation.MenuItem key={item.href}>
                  <TopNavigation.StaticMenuLink href={item.href} active={item.href === current}>
                    {item.label}
                  </TopNavigation.StaticMenuLink>
                </TopNavigation.MenuItem>
              ) : (
                <TopNavigation.MenuItem key={item.id}>
                  <TopNavigation.StaticMenuCollapsible defaultOpen={containsCurrent(item, current)}>
                    <TopNavigation.StaticMenuCollapsibleTrigger>
                      {item.label}
                    </TopNavigation.StaticMenuCollapsibleTrigger>
                    <TopNavigation.StaticMenuCollapsiblePanel>
                      <TopNavigation.MenuList>
                        {item.links.map((link) => (
                          <TopNavigation.MenuItem key={link.href}>
                            <TopNavigation.StaticMenuLink
                              href={link.href}
                              active={link.href === current}
                            >
                              {link.label}
                            </TopNavigation.StaticMenuLink>
                          </TopNavigation.MenuItem>
                        ))}
                      </TopNavigation.MenuList>
                    </TopNavigation.StaticMenuCollapsiblePanel>
                  </TopNavigation.StaticMenuCollapsible>
                </TopNavigation.MenuItem>
              ),
            )}
          </TopNavigation.MenuList>
        </TopNavigation.MenuGroup>
      ))}
    </>
  );
}
