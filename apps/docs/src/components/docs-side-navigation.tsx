import {SideNavigation} from '@earendil-works/elanor-react';

export interface DocsNavigationSection {
  readonly label: string;
  readonly links: ReadonlyArray<{readonly href: string; readonly label: string}>;
}

interface DocsSideNavigationProps {
  readonly sections: readonly DocsNavigationSection[];
  readonly current: string;
  readonly onNavigate?: () => void;
}

export function DocsSideNavigation({
  sections,
  current,
  onNavigate,
}: DocsSideNavigationProps): React.JSX.Element {
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
      {sections.map((section) => (
        <SideNavigation.Group key={section.label}>
          <SideNavigation.GroupLabel>{section.label}</SideNavigation.GroupLabel>
          <SideNavigation.List>
            {section.links.map((link) => (
              <SideNavigation.Item key={link.href}>
                <SideNavigation.Link
                  href={link.href}
                  active={link.href === current}
                  onClick={onNavigate}
                >
                  {link.label}
                </SideNavigation.Link>
              </SideNavigation.Item>
            ))}
          </SideNavigation.List>
        </SideNavigation.Group>
      ))}
    </SideNavigation.Root>
  );
}
