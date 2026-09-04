import {Popover as BasePopover} from '@base-ui/react/popover';
import {forwardRef} from 'react';
import styles from './popover.module.css';
import {mergeClassName} from './shared.ts';

export type {
  PopoverRootProps,
  PopoverRootActions,
  PopoverRootChangeEventReason,
  PopoverRootChangeEventDetails,
  PopoverTriggerState,
  PopoverTriggerProps,
  PopoverPortalState,
  PopoverPortalProps,
  PopoverPositionerState,
  PopoverPositionerProps,
  PopoverPopupState,
  PopoverPopupProps,
  PopoverArrowState,
  PopoverArrowProps,
  PopoverBackdropState,
  PopoverBackdropProps,
  PopoverTitleState,
  PopoverTitleProps,
  PopoverDescriptionState,
  PopoverDescriptionProps,
  PopoverCloseState,
  PopoverCloseProps,
  PopoverViewportState,
  PopoverViewportProps,
} from '@base-ui/react/popover';

export type PopoverHandle<Payload = unknown> = BasePopover.Handle<Payload>;

export const PopoverPopup = forwardRef<HTMLDivElement, BasePopover.Popup.Props>(
  function PopoverPopup({className, ...props}, ref) {
    return (
      <BasePopover.Popup
        {...props}
        ref={ref}
        className={mergeClassName<BasePopover.Popup.State>(styles.popup, className)}
      />
    );
  },
);

export const PopoverTitle = forwardRef<HTMLHeadingElement, BasePopover.Title.Props>(
  function PopoverTitle({className, ...props}, ref) {
    return (
      <BasePopover.Title
        {...props}
        ref={ref}
        className={mergeClassName<BasePopover.Title.State>(styles.title, className)}
      />
    );
  },
);

export const PopoverDescription = forwardRef<HTMLParagraphElement, BasePopover.Description.Props>(
  function PopoverDescription({className, ...props}, ref) {
    return (
      <BasePopover.Description
        {...props}
        ref={ref}
        className={mergeClassName<BasePopover.Description.State>(styles.description, className)}
      />
    );
  },
);

export const Popover = {
  Root: BasePopover.Root,
  Trigger: BasePopover.Trigger,
  Portal: BasePopover.Portal,
  Positioner: BasePopover.Positioner,
  Popup: PopoverPopup,
  Arrow: BasePopover.Arrow,
  Backdrop: BasePopover.Backdrop,
  Title: PopoverTitle,
  Description: PopoverDescription,
  Close: BasePopover.Close,
  Viewport: BasePopover.Viewport,
  createHandle: BasePopover.createHandle,
} as const;
