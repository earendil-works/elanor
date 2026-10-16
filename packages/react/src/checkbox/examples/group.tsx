import {Checkbox, Fieldset, SelectionControlAndLabel, Stack} from '@earendil-works/elanor-react';

const protocols = ['HTTP', 'HTTPS', 'SSH'];

export default function CheckboxGroup() {
  return (
    <Fieldset.Root render={<Checkbox.Group defaultValue={['HTTPS']} />}>
      <Fieldset.Legend>Allowed protocols</Fieldset.Legend>
      <Stack gap="small">
        {protocols.map((protocol) => (
          <SelectionControlAndLabel
            key={protocol}
            control={
              <Checkbox.Root value={protocol}>
                <Checkbox.Indicator />
              </Checkbox.Root>
            }
          >
            {protocol}
          </SelectionControlAndLabel>
        ))}
      </Stack>
    </Fieldset.Root>
  );
}
