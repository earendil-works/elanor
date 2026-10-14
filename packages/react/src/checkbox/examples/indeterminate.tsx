import {Checkbox, SelectionControlAndLabel, Stack} from '@earendil-works/elanor-react';
import {useState} from 'react';

const projects = ['Website redesign', 'Design system', 'Release notes'];

export default function CheckboxIndeterminate() {
  const [selected, setSelected] = useState(['Design system']);
  const allSelected = selected.length === projects.length;

  return (
    <Stack gap="small">
      <SelectionControlAndLabel
        control={
          <Checkbox.Root
            checked={allSelected}
            indeterminate={selected.length > 0 && !allSelected}
            onCheckedChange={(checked) => setSelected(checked ? projects : [])}
          >
            <Checkbox.Indicator />
          </Checkbox.Root>
        }
      >
        All projects
      </SelectionControlAndLabel>
      <Stack
        gap="small"
        style={{paddingInlineStart: 'var(--semantic-dimension-space-padding-xx-large)'}}
      >
        {projects.map((project) => (
          <SelectionControlAndLabel
            key={project}
            control={
              <Checkbox.Root
                checked={selected.includes(project)}
                onCheckedChange={(checked) =>
                  setSelected((current) =>
                    checked ? [...current, project] : current.filter((item) => item !== project),
                  )
                }
              >
                <Checkbox.Indicator />
              </Checkbox.Root>
            }
          >
            {project}
          </SelectionControlAndLabel>
        ))}
      </Stack>
    </Stack>
  );
}
