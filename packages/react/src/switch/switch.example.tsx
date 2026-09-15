import {Switch} from './switch.tsx';

export function SwitchExample(): React.JSX.Element {
  return (
    <Switch.Root defaultChecked aria-label="Notifications">
      <Switch.Thumb />
    </Switch.Root>
  );
}
