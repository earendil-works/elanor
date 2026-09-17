import {Popover} from './popover.tsx';

export function PopoverExample(): React.JSX.Element {
  return (
    <Popover.Root>
      <Popover.Trigger>Open popover</Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner>
          <Popover.Popup>
            <Popover.Title>Popover title</Popover.Title>
            <Popover.Description>Popover description</Popover.Description>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
