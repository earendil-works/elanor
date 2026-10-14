import {AddIcon} from '@earendil-works/elanor-icons-react';
import {ProjectSwitcher, Stack, Text} from '@earendil-works/elanor-react';
import {useState} from 'react';

const projects = ['Website redesign', 'Design system'];

export default function ProjectSwitcherDemo() {
  const [project, setProject] = useState('Website redesign');
  const [status, setStatus] = useState('');

  return (
    <Stack gap="small">
      <ProjectSwitcher.Root>
        <ProjectSwitcher.Trigger>{project}</ProjectSwitcher.Trigger>
        <ProjectSwitcher.Portal>
          <ProjectSwitcher.Positioner align="start">
            <ProjectSwitcher.Popup>
              <ProjectSwitcher.Group>
                <ProjectSwitcher.GroupLabel>Projects</ProjectSwitcher.GroupLabel>
                {projects.map((name) => (
                  <ProjectSwitcher.Item
                    key={name}
                    onClick={() => {
                      setProject(name);
                      setStatus(`Switched to ${name}.`);
                    }}
                  >
                    {name}
                  </ProjectSwitcher.Item>
                ))}
              </ProjectSwitcher.Group>
              <ProjectSwitcher.Separator />
              <ProjectSwitcher.Group>
                <ProjectSwitcher.Item
                  icon={<AddIcon />}
                  onClick={() => setStatus('Selected: New project.')}
                >
                  New project
                </ProjectSwitcher.Item>
              </ProjectSwitcher.Group>
            </ProjectSwitcher.Popup>
          </ProjectSwitcher.Positioner>
        </ProjectSwitcher.Portal>
      </ProjectSwitcher.Root>
      <Text role="status">{status}</Text>
    </Stack>
  );
}
