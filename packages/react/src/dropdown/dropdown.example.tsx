import {Stack, Dropdown} from '@earendil-works/elanor-react';

export function DropdownExample(): React.JSX.Element {
  return (
    <Dropdown.Root
      items={[
        {value: 'alpha', label: 'Alpha'},
        {value: 'beta', label: 'Beta'},
      ]}
    >
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
              <Dropdown.Item value="alpha">Alpha</Dropdown.Item>
              <Dropdown.Item value="beta">Beta</Dropdown.Item>
            </Dropdown.List>
          </Dropdown.Popup>
        </Dropdown.Positioner>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}

export function DropdownRadioExample(): React.JSX.Element {
  return (
    <Dropdown.Root defaultValue="Alpha">
      <Stack gap="small">
        <Dropdown.Label>Primary project</Dropdown.Label>
        <Dropdown.Trigger>
          <Dropdown.Value />
          <Dropdown.Icon />
        </Dropdown.Trigger>
      </Stack>
      <Dropdown.Portal>
        <Dropdown.Positioner>
          <Dropdown.Popup>
            <Dropdown.List>
              {['Alpha', 'Beta', 'Gamma'].map((project) => (
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

export function DropdownMultipleExample(): React.JSX.Element {
  return (
    <Dropdown.Root multiple defaultValue={['Alpha']}>
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
              {['Alpha', 'Beta', 'Gamma'].map((project) => (
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
