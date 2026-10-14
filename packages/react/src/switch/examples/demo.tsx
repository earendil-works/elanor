import {SelectionControlAndLabel, Switch} from '@earendil-works/elanor-react';

export default function SwitchDemo() {
  return (
    <SelectionControlAndLabel
      control={
        <Switch.Root defaultChecked>
          <Switch.Thumb />
        </Switch.Root>
      }
    >
      Desktop notifications
    </SelectionControlAndLabel>
  );
}
