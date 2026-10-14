import {Checkbox, SelectionControlAndLabel} from '@earendil-works/elanor-react';

export default function CheckboxDemo() {
  return (
    <SelectionControlAndLabel
      control={
        <Checkbox.Root defaultChecked>
          <Checkbox.Indicator />
        </Checkbox.Root>
      }
    >
      Include archived projects
    </SelectionControlAndLabel>
  );
}
