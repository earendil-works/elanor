import {Popover as BasePopover} from '@base-ui/react/popover';
import {PopoverDescription, PopoverPopup, PopoverTitle} from './popover.tsx';

// Keep utilities outside the component-only Fast Refresh boundary.
export const Popover = {
  Root: BasePopover.Root,
  Trigger: BasePopover.Trigger,
  Portal: BasePopover.Portal,
  Positioner: BasePopover.Positioner,
  Popup: PopoverPopup,
  Title: PopoverTitle,
  Description: PopoverDescription,
  Close: BasePopover.Close,
  createHandle: BasePopover.createHandle,
} as const;

export {PopoverDescription, PopoverPopup, PopoverTitle};
export type {
  PopoverCloseProps,
  PopoverDescriptionProps,
  PopoverHandle,
  PopoverPopupProps,
  PopoverPopupState,
  PopoverPortalProps,
  PopoverPositionerProps,
  PopoverPositionerState,
  PopoverRootActions,
  PopoverRootChangeEventDetails,
  PopoverRootChangeEventReason,
  PopoverRootProps,
  PopoverTitleProps,
  PopoverTriggerProps,
  PopoverTriggerState,
} from './popover.tsx';
