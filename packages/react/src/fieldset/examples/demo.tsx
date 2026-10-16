import {Checkbox, Fieldset, SelectionControlAndLabel, Stack} from '@earendil-works/elanor-react';

const topics = ['Deployments', 'Incidents', 'Billing'];

export default function FieldsetDemo() {
  return (
    <Fieldset.Root render={<Checkbox.Group defaultValue={['Incidents']} />}>
      <Fieldset.Legend>Notify me about</Fieldset.Legend>
      <Stack gap="small">
        {topics.map((topic) => (
          <SelectionControlAndLabel
            key={topic}
            control={
              <Checkbox.Root value={topic}>
                <Checkbox.Indicator />
              </Checkbox.Root>
            }
          >
            {topic}
          </SelectionControlAndLabel>
        ))}
      </Stack>
    </Fieldset.Root>
  );
}
