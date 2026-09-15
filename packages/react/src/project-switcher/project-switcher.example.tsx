import {ProjectSwitcher} from './project-switcher.tsx';

export function ProjectSwitcherExample(): React.JSX.Element {
  return (
    <ProjectSwitcher.Root>
      <ProjectSwitcher.Trigger>Project Alpha</ProjectSwitcher.Trigger>
      <ProjectSwitcher.Portal>
        <ProjectSwitcher.Positioner>
          <ProjectSwitcher.Popup>
            <ProjectSwitcher.Item>Project Alpha</ProjectSwitcher.Item>
            <ProjectSwitcher.Item>Project Beta</ProjectSwitcher.Item>
          </ProjectSwitcher.Popup>
        </ProjectSwitcher.Positioner>
      </ProjectSwitcher.Portal>
    </ProjectSwitcher.Root>
  );
}
