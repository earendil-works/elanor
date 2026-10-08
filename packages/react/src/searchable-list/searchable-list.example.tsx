import {useState} from 'react';
import {SearchableDropdown} from '../dropdown/index.ts';
import {Field} from '../field/field.tsx';

const projects = ['Alpha', 'Beta', 'Gamma'];

export function SearchableListExample({inputId}: {readonly inputId: string}): React.JSX.Element {
  const [project, setProject] = useState<string | null>(null);

  return (
    <Field.Root>
      <SearchableDropdown.Root inline open items={projects} value={project} onValueChange={setProject}>
        <Field.Label htmlFor={inputId}>Find a project</Field.Label>
        <SearchableDropdown.InputGroup>
          <SearchableDropdown.Input id={inputId} placeholder="Filter projects" />
        </SearchableDropdown.InputGroup>
        <SearchableDropdown.Empty>No projects found.</SearchableDropdown.Empty>
        <SearchableDropdown.List aria-label="Projects">
          {(item: string) => (
            <SearchableDropdown.Item key={item} value={item}>
              <SearchableDropdown.ItemIndicator />
              {item}
            </SearchableDropdown.Item>
          )}
        </SearchableDropdown.List>
        <SearchableDropdown.Status>{project === null ? null : `Selected ${project}.`}</SearchableDropdown.Status>
      </SearchableDropdown.Root>
    </Field.Root>
  );
}
