import {Radio, SelectionControlAndLabel, Stack} from '@earendil-works/elanor-react';

export default function RadioDisabled() {
  return (
    <Radio.Group defaultValue="Standard" aria-label="Support plan">
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
    </Radio.Group>
  );
}
