import {useState} from 'react';
import {SearchableDropdown, Stack} from '@earendil-works/elanor-react';

const projects = ['Alpha', 'Beta', 'Gamma'];

export function SearchableListExample(): React.JSX.Element {
  const [project, setProject] = useState<string | null>(null);

  return (
    <SearchableDropdown.Root inline open items={projects} value={project} onValueChange={setProject}>
      <Stack gap="small" align="stretch">
        <label htmlFor="searchable-list-project">Find a project</label>
        <SearchableDropdown.InputGroup>
          <SearchableDropdown.Input id="searchable-list-project" placeholder="Filter projects" />
        </SearchableDropdown.InputGroup>
        <SearchableDropdown.Empty>No projects found.</SearchableDropdown.Empty>
        <SearchableDropdown.List>
          {(item: string) => (
            <SearchableDropdown.Item key={item} value={item}>
              <SearchableDropdown.ItemIndicator />
              {item}
            </SearchableDropdown.Item>
          )}
        </SearchableDropdown.List>
        <SearchableDropdown.Status>{project === null ? null : `Selected ${project}.`}</SearchableDropdown.Status>
      </Stack>
    </SearchableDropdown.Root>
  );
}
