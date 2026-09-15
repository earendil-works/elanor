import {
  SideNavigationGroup,
  SideNavigationItem,
  SideNavigationLink,
  SideNavigationList,
  SideNavigationRoot,
} from '@earendil-works/elanor-react';

interface DocsSideNavigationProps {
  readonly components: readonly string[];
  readonly currentComponent: string;
}

function componentName(component: string): string {
  return component
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function DocsSideNavigation({
  components,
  currentComponent,
}: DocsSideNavigationProps): React.JSX.Element {
  return (
    <SideNavigationRoot>
      <SideNavigationGroup>
        <SideNavigationList>
          {components.map((component) => (
            <SideNavigationItem key={component}>
              <SideNavigationLink
                href={`/components/${component}/`}
                active={component === currentComponent}
              >
                {componentName(component)}
              </SideNavigationLink>
            </SideNavigationItem>
          ))}
        </SideNavigationList>
      </SideNavigationGroup>
    </SideNavigationRoot>
  );
}
