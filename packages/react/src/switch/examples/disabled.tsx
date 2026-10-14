import {SelectionControlAndLabel, Switch} from '@earendil-works/elanor-react';

export default function SwitchDisabled() {
  return (
    <SelectionControlAndLabel
      control={
        <Switch.Root disabled>
          <Switch.Thumb />
        </Switch.Root>
      }
    >
      Single sign-on (Enterprise only)
    </SelectionControlAndLabel>
  );
}
