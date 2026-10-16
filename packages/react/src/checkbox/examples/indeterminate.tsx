import {Checkbox, Fieldset, SelectionControlAndLabel, Stack} from '@earendil-works/elanor-react';
import {useState} from 'react';

const projects = ['Website redesign', 'Design system', 'Release notes'];

export default function CheckboxIndeterminate() {
  const [selected, setSelected] = useState(['Design system']);

  return (
    <Fieldset.Root
      render={<Checkbox.Group value={selected} onValueChange={setSelected} allValues={projects} />}
    >
      <Fieldset.Legend>Projects to archive</Fieldset.Legend>
      <Stack gap="small">
        <SelectionControlAndLabel
          control={
            <Checkbox.Root parent>
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
                <Checkbox.Root value={project}>
                  <Checkbox.Indicator />
                </Checkbox.Root>
              }
            >
              {project}
            </SelectionControlAndLabel>
          ))}
        </Stack>
      </Stack>
    </Fieldset.Root>
  );
}
