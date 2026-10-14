import {Checkbox, SelectionControlAndLabel} from '@earendil-works/elanor-react';

export default function CheckboxDisabled() {
  return (
    <SelectionControlAndLabel
      control={
        <Checkbox.Root disabled>
          <Checkbox.Indicator />
        </Checkbox.Root>
      }
    >
      Include deleted projects
    </SelectionControlAndLabel>
  );
}
