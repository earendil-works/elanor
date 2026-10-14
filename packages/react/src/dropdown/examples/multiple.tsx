import {Dropdown, Stack} from '@earendil-works/elanor-react';

const projects = ['Website redesign', 'Design system', 'Release notes'];

export default function DropdownMultiple() {
  return (
    <Dropdown.Root multiple defaultValue={['Design system']}>
      <Stack gap="small">
        <Dropdown.Label>Projects</Dropdown.Label>
        <Dropdown.Trigger>
          <Dropdown.Value placeholder="Select projects" />
          <Dropdown.Icon />
        </Dropdown.Trigger>
      </Stack>
      <Dropdown.Portal>
        <Dropdown.Positioner>
          <Dropdown.Popup>
            <Dropdown.List>
              {projects.map((project) => (
                <Dropdown.Item key={project} value={project}>
                  <Dropdown.ItemIndicator />
                  <Dropdown.ItemText>{project}</Dropdown.ItemText>
                </Dropdown.Item>
              ))}
            </Dropdown.List>
          </Dropdown.Popup>
        </Dropdown.Positioner>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}
