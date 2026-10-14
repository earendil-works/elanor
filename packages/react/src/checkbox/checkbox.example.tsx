import {Checkbox, SelectionControlAndLabel} from '@earendil-works/elanor-react';

export function CheckboxExample(): React.JSX.Element {
  return (
    <SelectionControlAndLabel
      control={<Checkbox.Root defaultChecked><Checkbox.Indicator /></Checkbox.Root>}
    >
      Include archived projects
    </SelectionControlAndLabel>
  );
}
