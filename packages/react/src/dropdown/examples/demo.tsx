import {Dropdown, Stack} from '@earendil-works/elanor-react';

const projects = ['Website redesign', 'Design system', 'Release notes'];

export default function DropdownDemo() {
  return (
    <Dropdown.Root>
      <Stack gap="small">
        <Dropdown.Label>Project</Dropdown.Label>
        <Dropdown.Trigger>
          <Dropdown.Value placeholder="Select a project" />
          <Dropdown.Icon />
        </Dropdown.Trigger>
      </Stack>
      <Dropdown.Portal>
        <Dropdown.Positioner>
          <Dropdown.Popup>
            <Dropdown.List>
              {projects.map((project) => (
                <Dropdown.Item key={project} value={project}>
                  {project}
                </Dropdown.Item>
              ))}
            </Dropdown.List>
          </Dropdown.Popup>
        </Dropdown.Positioner>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}
