import {useState} from 'react';
import {Stack} from '../stack/stack.tsx';
import {SearchableDropdown} from './searchable-dropdown.tsx';

const projects = ['Alpha', 'Beta', 'Gamma'];

export function SearchableDropdownExample(): React.JSX.Element {
  const [project, setProject] = useState<string | null>(null);

  return (
    <div>
      <SearchableDropdown.Root items={projects} value={project} onValueChange={setProject}>
        <Stack gap="small">
          <SearchableDropdown.Label>Searchable project</SearchableDropdown.Label>
          <SearchableDropdown.Trigger>
            <SearchableDropdown.Value placeholder="Select a project" />
            <SearchableDropdown.Icon />
          </SearchableDropdown.Trigger>
        </Stack>
        <SearchableDropdown.Portal>
          <SearchableDropdown.Positioner>
            <SearchableDropdown.Popup>
              <SearchableDropdown.InputGroup>
                <SearchableDropdown.Input aria-label="Filter projects" placeholder="Filter projects" />
              </SearchableDropdown.InputGroup>
              <SearchableDropdown.List>
                {(item: string) => (
                  <SearchableDropdown.Item key={item} value={item}>
                    {item}
                  </SearchableDropdown.Item>
                )}
              </SearchableDropdown.List>
            </SearchableDropdown.Popup>
          </SearchableDropdown.Positioner>
        </SearchableDropdown.Portal>
        <SearchableDropdown.Status>{project === null ? null : `Selected ${project}.`}</SearchableDropdown.Status>
      </SearchableDropdown.Root>
    </div>
  );
}
