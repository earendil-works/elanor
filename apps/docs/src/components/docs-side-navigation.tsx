import {SideNavigation} from '@earendil-works/elanor-react';
import {useState} from 'react';

export interface DocsNavigationLink {
  readonly type: 'link';
  readonly href: string;
  readonly label: string;
}

/** Links under a title that opens and closes. */
export interface DocsNavigationSection {
  readonly type: 'section';
  readonly id: string;
  readonly label: string;
  readonly links: readonly DocsNavigationLink[];
}

export type DocsNavigationItem = DocsNavigationLink | DocsNavigationSection;

export interface DocsNavigationGroup {
  readonly label: string;
  readonly items: readonly DocsNavigationItem[];
}

interface DocsSideNavigationProps {
  readonly groups: readonly DocsNavigationGroup[];
  readonly current: string;
  readonly onNavigate?: () => void;
}

function sectionOf(groups: readonly DocsNavigationGroup[], current: string): string | undefined {
  for (const group of groups) {
    for (const item of group.items) {
      if (item.type === 'section' && item.links.some((link) => link.href === current)) {
        return item.id;
      }
    }
  }
  return undefined;
}

function withSection(open: ReadonlySet<string>, id: string | undefined): ReadonlySet<string> {
  return id === undefined || open.has(id) ? open : new Set(open).add(id);
}

export function DocsSideNavigation({
  groups,
  current,
  onNavigate,
}: DocsSideNavigationProps): React.JSX.Element {
  // Only the current page's section starts open, so the server and client render the same.
  const [open, setOpen] = useState(() => withSection(new Set(), sectionOf(groups, current)));
  const [previous, setPrevious] = useState(current);
  // A persisted sidebar gets a new `current` on client-side navigation; open its section too.
  if (current !== previous) {
    setPrevious(current);
    setOpen((sections) => withSection(sections, sectionOf(groups, current)));
  }

  const toggle = (id: string, next: boolean) => {
    setOpen((sections) => {
      const updated = new Set(sections);
      if (next) updated.add(id);
      else updated.delete(id);
      return updated;
    });
  };

  const renderLink = (link: DocsNavigationLink) => (
    <SideNavigation.Item key={link.href}>
      <SideNavigation.Link href={link.href} active={link.href === current} onClick={onNavigate}>
        {link.label}
      </SideNavigation.Link>
    </SideNavigation.Item>
  );

  return (
    <SideNavigation.Root aria-label="Documentation">
      <SideNavigation.List>
        <SideNavigation.Item>
          <SideNavigation.Link
            href="/"
            active={current === '/'}
            onClick={onNavigate}
            data-astro-reload
          >
            Home
          </SideNavigation.Link>
        </SideNavigation.Item>
      </SideNavigation.List>
      {groups.map((group) => (
        <SideNavigation.Group key={group.label}>
          <SideNavigation.GroupLabel>{group.label}</SideNavigation.GroupLabel>
          <SideNavigation.List>
            {group.items.map((item) =>
              item.type === 'link' ? (
                renderLink(item)
              ) : (
                <SideNavigation.Item key={item.id}>
                  <SideNavigation.Collapsible
                    open={open.has(item.id)}
                    onOpenChange={(next) => toggle(item.id, next)}
                  >
                    <SideNavigation.CollapsibleTrigger>
                      {item.label}
                    </SideNavigation.CollapsibleTrigger>
                    {/* Find in page can still reach and open a closed section. */}
                    <SideNavigation.CollapsiblePanel hiddenUntilFound>
                      <SideNavigation.List>{item.links.map(renderLink)}</SideNavigation.List>
                    </SideNavigation.CollapsiblePanel>
                  </SideNavigation.Collapsible>
                </SideNavigation.Item>
              ),
            )}
          </SideNavigation.List>
        </SideNavigation.Group>
      ))}
    </SideNavigation.Root>
  );
}
