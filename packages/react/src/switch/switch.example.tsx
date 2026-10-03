import {SelectionControlAndLabel} from '../selection-control-label/selection-control-label.tsx';
import {Switch} from './switch.tsx';

export function SwitchExample(): React.JSX.Element {
  return (
    <SelectionControlAndLabel
      control={<Switch.Root defaultChecked><Switch.Thumb /></Switch.Root>}
    >
      Desktop notifications
    </SelectionControlAndLabel>
  );
}
