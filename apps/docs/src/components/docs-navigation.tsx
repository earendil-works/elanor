import {ScrollArea, Separator, SideNavigation, TopNavigation} from '@earendil-works/elanor-react';

import {hasSideNavigation, type DocsSiteSection} from '../lib/docs-navigation.ts';
import {DocsSearchTrigger} from './docs-search.tsx';

/*
 * The documentation navigation on Elanor's static parts: the current section's pages as the side
 * navigation on wide screens, and every section's pages in the top navigation's menu on narrow
 * ones. `scripts/navigation-behaviors.ts` makes both work before the first paint.
 */

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
              {section.groups.map((group, index) => {
                const labelId = `docs-navigation-${section.id}-${index}`;
                return (
                  <SideNavigation.Group key={group.label ?? index}>
                    {group.label ? (
                      <SideNavigation.GroupLabel id={labelId}>
                        {group.label}
                      </SideNavigation.GroupLabel>
                    ) : null}
                    <SideNavigation.List aria-labelledby={group.label ? labelId : undefined}>
                      {group.links.map((link) => (
                        <SideNavigation.Item key={link.href}>
                          <SideNavigation.Link href={link.href} active={link.href === current}>
                            {link.label}
                          </SideNavigation.Link>
                        </SideNavigation.Item>
                      ))}
                    </SideNavigation.List>
                  </SideNavigation.Group>
                );
              })}
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
  const withPanels = sections.filter(hasSideNavigation);
  return (
    <>
      <TopNavigation.StaticMenuPanel panel="main">
        <TopNavigation.MenuList>
          {sections.map((section) => (
            <TopNavigation.MenuItem key={section.id}>
              {withPanels.includes(section) ? (
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
      {withPanels.map((section) => (
        <TopNavigation.StaticMenuPanel
          key={section.id}
          panel={section.id}
          parent="main"
          backLabel="Main menu"
        >
          {section.groups.map((group, index) => {
            const list = (
              <TopNavigation.MenuList>
                {group.links.map((link) => (
                  <TopNavigation.MenuItem key={link.href}>
                    <TopNavigation.StaticMenuLink href={link.href} active={link.href === current}>
                      {link.label}
                    </TopNavigation.StaticMenuLink>
                  </TopNavigation.MenuItem>
                ))}
              </TopNavigation.MenuList>
            );
            return group.label ? (
              <TopNavigation.MenuGroup key={group.label}>
                <TopNavigation.MenuGroupLabel>{group.label}</TopNavigation.MenuGroupLabel>
                {list}
              </TopNavigation.MenuGroup>
            ) : (
              <TopNavigation.MenuGroup key={index}>{list}</TopNavigation.MenuGroup>
            );
          })}
        </TopNavigation.StaticMenuPanel>
      ))}
    </>
  );
}
