import {AddIcon} from '@earendil-works/elanor-icons-react/add';
import {useState} from 'react';
import {Stack} from '../stack/stack.tsx';
import {Text} from '../text/text.tsx';
import {ProjectSwitcher} from './project-switcher.tsx';

export function ProjectSwitcherExample(): React.JSX.Element {
  const [project, setProject] = useState('Project Alpha');
  const [action, setAction] = useState('Choose a project or create a new one.');

  return (
    <Stack align="start" gap="small">
      <Text role="status">{action}</Text>
      <ProjectSwitcher.Root>
        <ProjectSwitcher.Trigger>{project}</ProjectSwitcher.Trigger>
        <ProjectSwitcher.Portal>
          <ProjectSwitcher.Positioner align="start">
            <ProjectSwitcher.Popup>
              <ProjectSwitcher.Group>
                <ProjectSwitcher.GroupLabel>PROJECTS</ProjectSwitcher.GroupLabel>
                {['Project Alpha', 'Project Beta'].map((name) => (
                  <ProjectSwitcher.Item
                    key={name}
                    onClick={() => {
                      setProject(name);
                      setAction(`Switched to ${name}.`);
                    }}
                  >
                    {name}
                  </ProjectSwitcher.Item>
                ))}
              </ProjectSwitcher.Group>
              <ProjectSwitcher.Group>
                <ProjectSwitcher.Separator />
                <ProjectSwitcher.Item
                  icon={<AddIcon />}
                  onClick={() => setAction('Selected: Create new project.')}
                >
                  Create new project
                </ProjectSwitcher.Item>
              </ProjectSwitcher.Group>
            </ProjectSwitcher.Popup>
          </ProjectSwitcher.Positioner>
        </ProjectSwitcher.Portal>
      </ProjectSwitcher.Root>
    </Stack>
  );
}
