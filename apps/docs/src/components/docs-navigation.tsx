import {ScrollArea, Separator, SideNavigation, TopNavigation} from '@earendil-works/elanor-react';

import type {DocsNavigationItem, DocsSiteSection} from '../lib/docs-navigation.ts';
import {DocsSearchTrigger} from './docs-search.tsx';

/*
 * The documentation navigation on Elanor's static parts: the current section's pages as the side
 * navigation on wide screens, and every section's pages in the top navigation's menu on narrow
 * ones. `scripts/navigation-behaviors.ts` makes both work before the first paint.
 */

const containsCurrent = (item: DocsNavigationItem, current: string) =>
  item.type === 'collapsible' && item.links.some((link) => link.href === current);

/** Whether a section has a side navigation: a section with one page has none. */
export const hasSideNavigation = (
  section: DocsSiteSection | undefined,
): section is DocsSiteSection => section !== undefined && section.items.length > 1;

interface DocsSideNavigationProps {
  readonly section: DocsSiteSection;
  /** The current page's path. */
  readonly current: string;
}

/** The current section's pages with the search above them, fixed beside the content. */
export function DocsSideNavigation({section, current}: DocsSideNavigationProps): React.JSX.Element {
  return (
    <div className="docs-navigation">
      <div className="docs-navigation-search">
        <DocsSearchTrigger />
        <Separator />
      </div>
      <ScrollArea.StaticRoot className="docs-navigation-scroll-area">
        <ScrollArea.StaticViewport className="docs-navigation-viewport">
          <ScrollArea.StaticContent className="docs-navigation-content">
            <SideNavigation.StaticRoot aria-label={section.label} persist={`docs-${section.id}`}>
              <SideNavigation.List>
                {section.items.map((item) =>
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

interface DocsMenuProps {
  readonly sections: readonly DocsSiteSection[];
  /** The current page's path. */
  readonly current: string;
  /** The current page's section. */
  readonly currentSection: DocsSiteSection | undefined;
}

/**
 * The menu's panels: the sections, each with several pages leading to a panel of them, like the
 * side navigation. The menu opens on the current section's panel.
 */
export function DocsMenuPanels({
  sections,
  current,
  currentSection,
}: DocsMenuProps): React.JSX.Element {
  return (
    <>
      <TopNavigation.StaticMenuPanel panel="main">
        <TopNavigation.MenuList>
          {sections.map((section) => (
            <TopNavigation.MenuItem key={section.id}>
              {section.items.length > 1 ? (
                <TopNavigation.StaticMenuPanelTrigger
                  panel={section.id}
                  active={section.id === currentSection?.id}
                >
                  {section.label}
                </TopNavigation.StaticMenuPanelTrigger>
              ) : (
                <TopNavigation.StaticMenuLink
                  href={section.href}
                  active={section.id === currentSection?.id}
                >
                  {section.label}
                </TopNavigation.StaticMenuLink>
              )}
            </TopNavigation.MenuItem>
          ))}
        </TopNavigation.MenuList>
      </TopNavigation.StaticMenuPanel>
      {sections.filter(hasSideNavigation).map((section) => (
        <TopNavigation.StaticMenuPanel
          key={section.id}
          panel={section.id}
          parent="main"
          backLabel="Main menu"
        >
          <TopNavigation.MenuList>
            {section.items.map((item) =>
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
        </TopNavigation.StaticMenuPanel>
      ))}
    </>
  );
}
