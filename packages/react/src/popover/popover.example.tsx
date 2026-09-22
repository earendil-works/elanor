import {Button} from '../button/button.tsx';
import {Popover} from './popover.tsx';

export function PopoverExample(): React.JSX.Element {
  return (
    <Popover.Root>
      <Popover.Trigger render={<Button hierarchy="secondary" />}>Usage limits</Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner>
          <Popover.Popup>
            <Popover.Title>Monthly usage</Popover.Title>
            <Popover.Description>
              Usage resets on the first day of each month. Unused credits do not carry over.
            </Popover.Description>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
