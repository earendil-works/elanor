import {Popover as BasePopover} from '@base-ui/react/popover';
import {forwardRef, type ComponentPropsWithRef} from 'react';
import styles from './popover.module.css';
import {useSurfaceClassName} from '../appearance/appearance.tsx';
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

export interface PopoverPopupProps extends BasePopover.Popup.Props {
  /** The inner scroll container; the popup ref/style/className remain on the surface. */
  readonly bodyProps?: Omit<ComponentPropsWithRef<'div'>, 'children' | 'dangerouslySetInnerHTML'>;
}
export type PopoverTitleProps = BasePopover.Title.Props;
export type PopoverDescriptionProps = BasePopover.Description.Props;

export const PopoverPopup = forwardRef<HTMLDivElement, PopoverPopupProps>(
  function PopoverPopup({className, bodyProps, children, ...props}, ref) {
    const surfaceClassName = useSurfaceClassName();
    return (
      <BasePopover.Popup
        data-outline="box-small"
        data-outline-focus="none"
        {...props}
        ref={ref}
        className={mergeClassName<BasePopover.Popup.State>(classes(styles.popup, surfaceClassName), className)}
      >
        <div data-surface-content="" {...bodyProps} className={classes(styles.body, bodyProps?.className)}>{children}</div>
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
