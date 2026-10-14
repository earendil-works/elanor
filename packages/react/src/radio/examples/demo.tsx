import {Radio, SelectionControlAndLabel, Stack} from '@earendil-works/elanor-react';

const frequencies = ['Daily', 'Weekly', 'Monthly'];

export default function RadioDemo() {
  return (
    <Radio.Group defaultValue="Weekly" aria-label="Email digest frequency">
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
    </Radio.Group>
  );
}
