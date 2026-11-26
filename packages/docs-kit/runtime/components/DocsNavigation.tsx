/** @jsxImportSource react */
import {ScrollArea, SideNavigation, TopNavigation} from '@earendil-works/elanor-react';

/*
 * The site's pages on Elanor's static parts: the side navigation beside the content on wide
 * screens, and the top navigation's menu on narrow ones, with sections that expand.
 * `scripts/navigation-behaviors.ts` makes both work before the first paint, and the side
 * navigation remembers its open sections and scroll position across pages.
 */

export interface NavigationLink {
  readonly href: string;
  readonly label: string;
}

export type NavigationNode =
  | ({readonly kind: 'link'} & NavigationLink)
  | {
      readonly kind: 'section';
      /** Names the section's remembered state. */
      readonly id: string;
      readonly label: string;
      readonly open: boolean;
      readonly items: readonly NavigationNode[];
    };

export interface NavigationGroup {
  readonly label: string | undefined;
  readonly items: readonly NavigationNode[];
}

interface NavigationProps {
  readonly groups: readonly NavigationGroup[];
  /** The current page's address. */
  readonly current: string;
}

function SideItems({
  items,
  current,
}: {
  readonly items: readonly NavigationNode[];
  readonly current: string;
}) {
  return items.map((item) => (
    <SideNavigation.Item key={item.kind === 'link' ? item.href : item.id}>
      {item.kind === 'link' ? (
        <SideNavigation.Link href={item.href} active={item.href === current}>
          {item.label}
        </SideNavigation.Link>
      ) : (
        <SideNavigation.StaticCollapsible defaultOpen={item.open} persist={item.id}>
          <SideNavigation.StaticCollapsibleTrigger>
            {item.label}
          </SideNavigation.StaticCollapsibleTrigger>
          <SideNavigation.StaticCollapsiblePanel>
            <SideNavigation.List>
              <SideItems items={item.items} current={current} />
            </SideNavigation.List>
          </SideNavigation.StaticCollapsiblePanel>
        </SideNavigation.StaticCollapsible>
      )}
    </SideNavigation.Item>
  ));
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
                      <SideItems items={group.items} current={current} />
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

function MenuItems({
  items,
  current,
}: {
  readonly items: readonly NavigationNode[];
  readonly current: string;
}) {
  return (
    <TopNavigation.MenuList>
      {items.map((item) => (
        <TopNavigation.MenuItem key={item.kind === 'link' ? item.href : item.id}>
          {item.kind === 'link' ? (
            <TopNavigation.StaticMenuLink href={item.href} active={item.href === current}>
              {item.label}
            </TopNavigation.StaticMenuLink>
          ) : (
            <TopNavigation.StaticMenuCollapsible defaultOpen={item.open}>
              <TopNavigation.StaticMenuCollapsibleTrigger>
                {item.label}
              </TopNavigation.StaticMenuCollapsibleTrigger>
              <TopNavigation.StaticMenuCollapsiblePanel>
                <MenuItems items={item.items} current={current} />
              </TopNavigation.StaticMenuCollapsiblePanel>
            </TopNavigation.StaticMenuCollapsible>
          )}
        </TopNavigation.MenuItem>
      ))}
    </TopNavigation.MenuList>
  );
}

/** The menu's one panel: the pages in their groups, then the top navigation's links. */
export function DocsMenuPanel({
  groups,
  current,
  links,
}: NavigationProps & {readonly links: readonly NavigationLink[]}): React.JSX.Element {
  return (
    <TopNavigation.StaticMenuPanel panel="main">
      {groups.map((group, index) => (
        <TopNavigation.MenuGroup key={group.label ?? index}>
          {group.label ? (
            <TopNavigation.MenuGroupLabel>{group.label}</TopNavigation.MenuGroupLabel>
          ) : null}
          <MenuItems items={group.items} current={current} />
        </TopNavigation.MenuGroup>
      ))}
      {links.length > 0 ? (
        <TopNavigation.MenuGroup>
          <MenuItems items={links.map((link) => ({kind: 'link', ...link}))} current={current} />
        </TopNavigation.MenuGroup>
      ) : null}
    </TopNavigation.StaticMenuPanel>
  );
}
