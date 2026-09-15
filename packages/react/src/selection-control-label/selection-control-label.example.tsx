import {Checkbox} from '../checkbox/checkbox.tsx';
import {SelectionControlAndLabel} from './selection-control-label.tsx';

export function SelectionControlLabelExample(): React.JSX.Element {
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
