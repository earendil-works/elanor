import {Fieldset, Radio, SelectionControlAndLabel, Stack} from '@earendil-works/elanor-react';

export default function RadioDisabled() {
  return (
    <Fieldset.Root render={<Radio.Group defaultValue="Standard" />}>
      <Fieldset.Legend>Support plan</Fieldset.Legend>
      <Stack gap="small">
        <SelectionControlAndLabel
          control={
            <Radio.Root value="Standard">
              <Radio.Indicator />
            </Radio.Root>
          }
        >
          Standard
        </SelectionControlAndLabel>
        <SelectionControlAndLabel
          control={
            <Radio.Root value="Priority" disabled>
              <Radio.Indicator />
            </Radio.Root>
          }
        >
          Priority (Enterprise only)
        </SelectionControlAndLabel>
      </Stack>
    </Fieldset.Root>
  );
}
