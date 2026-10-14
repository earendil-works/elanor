import {Checkbox, SelectionControlAndLabel} from '@earendil-works/elanor-react';

export default function SelectionControlAndLabelLongLabel() {
  return (
    <SelectionControlAndLabel
      control={
        <Checkbox.Root>
          <Checkbox.Indicator />
        </Checkbox.Root>
      }
    >
      Send me a weekly summary of project activity, including comments, assignments, and upcoming
      deadlines.
    </SelectionControlAndLabel>
  );
}
