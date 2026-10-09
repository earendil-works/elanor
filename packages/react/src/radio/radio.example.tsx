import {SelectionControlAndLabel, Stack, Radio} from '@earendil-works/elanor-react';

export function RadioExample(): React.JSX.Element {
  return (
    <Radio.Group defaultValue="daily" aria-label="Email digest frequency">
      <Stack gap="small">
        <SelectionControlAndLabel
          control={
            <Radio.Root value="daily">
              <Radio.Indicator />
            </Radio.Root>
          }
        >
          Daily digest
        </SelectionControlAndLabel>
        <SelectionControlAndLabel
          control={
            <Radio.Root value="weekly">
              <Radio.Indicator />
            </Radio.Root>
          }
        >
          Weekly digest
        </SelectionControlAndLabel>
      </Stack>
    </Radio.Group>
  );
}
