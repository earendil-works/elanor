/** @jsxImportSource react */
import {ScrollArea, SideNavigation, TopNavigation} from '@earendil-works/elanor-react';

/*
 * The site's pages on Elanor's static parts: the side navigation beside the content on wide
 * screens, and the top navigation's menu on narrow ones. `scripts/navigation-behaviors.ts` makes
 * the side navigation work before the first paint.
 */

export interface NavigationLink {
  readonly href: string;
  readonly label: string;
}

export interface NavigationGroup {
  readonly label: string | undefined;
  readonly links: readonly NavigationLink[];
}

interface NavigationProps {
  readonly groups: readonly NavigationGroup[];
  /** The current page's address. */
  readonly current: string;
}

/** The pages, fixed beside the content. */
export function DocsSideNavigation({
  groups,
  current,
  name,
}: NavigationProps & {readonly name: string}): React.JSX.Element {
  return (
    <div className="docs-navigation">
      <ScrollArea.StaticRoot className="docs-navigation-scroll-area">
        <ScrollArea.StaticViewport className="docs-navigation-viewport">
          <ScrollArea.StaticContent className="docs-navigation-content">
            <SideNavigation.StaticRoot aria-label={name} persist="elanor-docs">
              {groups.map((group, index) => {
                const labelId = `docs-navigation-${index}`;
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

/** The menu's one panel: the top navigation's links, then the pages in their groups. */
export function DocsMenuPanel({
  groups,
  current,
  links,
}: NavigationProps & {readonly links: readonly NavigationLink[]}): React.JSX.Element {
  const list = (items: readonly NavigationLink[]) => (
    <TopNavigation.MenuList>
      {items.map((link) => (
        <TopNavigation.MenuItem key={link.href}>
          <TopNavigation.StaticMenuLink href={link.href} active={link.href === current}>
            {link.label}
          </TopNavigation.StaticMenuLink>
        </TopNavigation.MenuItem>
      ))}
    </TopNavigation.MenuList>
  );
  return (
    <TopNavigation.StaticMenuPanel panel="main">
      {groups.map((group, index) =>
        group.label ? (
          <TopNavigation.MenuGroup key={group.label}>
            <TopNavigation.MenuGroupLabel>{group.label}</TopNavigation.MenuGroupLabel>
            {list(group.links)}
          </TopNavigation.MenuGroup>
        ) : (
          <TopNavigation.MenuGroup key={index}>{list(group.links)}</TopNavigation.MenuGroup>
        ),
      )}
      {links.length > 0 ? <TopNavigation.MenuGroup>{list(links)}</TopNavigation.MenuGroup> : null}
    </TopNavigation.StaticMenuPanel>
  );
}
