import {SelectionControlAndLabel, Switch} from '@earendil-works/elanor-react';

export function SwitchExample(): React.JSX.Element {
  return (
    <SelectionControlAndLabel
      control={<Switch.Root defaultChecked><Switch.Thumb /></Switch.Root>}
    >
      Desktop notifications
    </SelectionControlAndLabel>
  );
}
