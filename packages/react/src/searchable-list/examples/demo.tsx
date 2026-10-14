import {Field, SearchableDropdown} from '@earendil-works/elanor-react';
import {useId, useState} from 'react';

const projects = ['Website redesign', 'Design system', 'Release notes', 'Help center'];

export default function SearchableListDemo() {
  const inputId = useId();
  const [project, setProject] = useState<string | null>(null);

  return (
    <Field.Root>
      <SearchableDropdown.Root
        inline
        open
        items={projects}
        value={project}
        onValueChange={setProject}
      >
        <Field.Label htmlFor={inputId}>Project</Field.Label>
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
        <SearchableDropdown.Status>
          {project === null ? null : `Selected ${project}.`}
        </SearchableDropdown.Status>
      </SearchableDropdown.Root>
    </Field.Root>
  );
}
