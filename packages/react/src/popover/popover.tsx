import {Popover as BasePopover} from '@base-ui/react/popover';
import {forwardRef} from 'react';
import styles from './popover.module.css';
import outline from '../utils/outline.module.css';
import {classes, mergeClassName} from '../utils/class-names.ts';

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

export const PopoverPopup = forwardRef<HTMLDivElement, PopoverPopupProps>(
  function PopoverPopup({className, children, ...props}, ref) {
    return (
      <BasePopover.Popup
        data-outline="box-small"
        data-outline-focus="none"
        {...props}
        ref={ref}
        className={mergeClassName<BasePopover.Popup.State>(classes(styles.popup, outline.outline), className)}
      >
        {/* Content scrolls inside, so the popup itself can carry the outline. */}
        <div className={styles.body}>{children}</div>
      </BasePopover.Popup>
    );
  },
);

export const PopoverTitle = forwardRef<HTMLHeadingElement, PopoverTitleProps>(
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

export const PopoverDescription = forwardRef<HTMLParagraphElement, PopoverDescriptionProps>(
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
  Title: PopoverTitle,
  Description: PopoverDescription,
  Close: BasePopover.Close,
  createHandle: BasePopover.createHandle,
} as const;
