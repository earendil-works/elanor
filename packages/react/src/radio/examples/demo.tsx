import {Fieldset, Radio, SelectionControlAndLabel, Stack} from '@earendil-works/elanor-react';

const frequencies = ['Daily', 'Weekly', 'Monthly'];

export default function RadioDemo() {
  return (
    <Fieldset.Root render={<Radio.Group defaultValue="Weekly" />}>
      <Fieldset.Legend>Email digest</Fieldset.Legend>
      <Stack gap="small">
        {frequencies.map((frequency) => (
          <SelectionControlAndLabel
            key={frequency}
            control={
              <Radio.Root value={frequency}>
                <Radio.Indicator />
              </Radio.Root>
            }
          >
            {frequency}
          </SelectionControlAndLabel>
        ))}
      </Stack>
    </Fieldset.Root>
  );
}
