import {
  SideNavigationGroup,
  SideNavigationGroupLabel,
  SideNavigationItem,
  SideNavigationLink,
  SideNavigationList,
  SideNavigationRoot,
} from '@earendil-works/elanor-react';

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
    <SideNavigationRoot aria-label="Documentation">
      {sections.map((section) => (
        <SideNavigationGroup key={section.label}>
          <SideNavigationGroupLabel>{section.label}</SideNavigationGroupLabel>
          <SideNavigationList>
            {section.links.map((link) => (
              <SideNavigationItem key={link.href}>
                <SideNavigationLink
                  href={link.href}
                  active={link.href === current}
                  onClick={onNavigate}
                >
                  {link.label}
                </SideNavigationLink>
              </SideNavigationItem>
            ))}
          </SideNavigationList>
        </SideNavigationGroup>
      ))}
    </SideNavigationRoot>
  );
}
