import {SelectionControlAndLabel} from '../selection-control-label/selection-control-label.tsx';
import {Checkbox} from './checkbox.tsx';

export function CheckboxExample(): React.JSX.Element {
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
