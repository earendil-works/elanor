import {SelectionControlAndLabel} from '../selection-control-label/selection-control-label.tsx';
import {Stack} from '../stack/stack.tsx';
import {Radio} from './radio.tsx';

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
