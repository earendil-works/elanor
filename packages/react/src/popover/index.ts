import {Popover as BasePopover} from '@base-ui/react/popover';

export {
  PopoverPopup as Popup,
  PopoverTitle as Title,
  PopoverDescription as Description,
} from './popover.tsx';

export const Root = BasePopover.Root;
export const Trigger = BasePopover.Trigger;
export const Portal = BasePopover.Portal;
export const Positioner = BasePopover.Positioner;
export const Close = BasePopover.Close;
export const createHandle = BasePopover.createHandle;
