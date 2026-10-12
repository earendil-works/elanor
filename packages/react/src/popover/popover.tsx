import {Popover as BasePopover} from '@base-ui/react/popover';

import {mergeClassName} from '../utils/class-names.ts';

import styles from './popover.module.css';

export type {
  PopoverRootProps,
  PopoverRootActions,
  PopoverRootChangeEventReason,
  PopoverRootChangeEventDetails,
  PopoverTriggerState,
  PopoverTriggerProps,
  PopoverPortalProps,
  PopoverPositionerState,
  PopoverPositionerProps,
  PopoverPopupState,
  PopoverCloseProps,
} from '@base-ui/react/popover';

export type PopoverHandle<Payload = unknown> = BasePopover.Handle<Payload>;

export type PopoverPopupProps = BasePopover.Popup.Props;
export type PopoverTitleProps = BasePopover.Title.Props;
export type PopoverDescriptionProps = BasePopover.Description.Props;

export function PopoverPopup({ref, className, ...props}: PopoverPopupProps) {
  return (
    <BasePopover.Popup
      {...props}
      ref={ref}
      className={mergeClassName<BasePopover.Popup.State>(styles.popup, className)}
    />
  );
}

export function PopoverTitle({ref, className, ...props}: PopoverTitleProps) {
  return (
    <BasePopover.Title
      {...props}
      ref={ref}
      className={mergeClassName<BasePopover.Title.State>(styles.title, className)}
    />
  );
}

export function PopoverDescription({ref, className, ...props}: PopoverDescriptionProps) {
  return (
    <BasePopover.Description
      {...props}
      ref={ref}
      className={mergeClassName<BasePopover.Description.State>(styles.description, className)}
    />
  );
}
