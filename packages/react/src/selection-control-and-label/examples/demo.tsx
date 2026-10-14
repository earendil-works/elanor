import {Checkbox, SelectionControlAndLabel} from '@earendil-works/elanor-react';

export default function SelectionControlAndLabelDemo() {
  return (
    <SelectionControlAndLabel
      control={
        <Checkbox.Root defaultChecked>
          <Checkbox.Indicator />
        </Checkbox.Root>
      }
    >
      Email notifications
    </SelectionControlAndLabel>
  );
}
