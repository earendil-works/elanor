import {Checkbox} from './checkbox.tsx';

export function CheckboxExample(): React.JSX.Element {
  return (
    <Checkbox.Root defaultChecked aria-label="Selected">
      <Checkbox.Indicator />
    </Checkbox.Root>
  );
}
