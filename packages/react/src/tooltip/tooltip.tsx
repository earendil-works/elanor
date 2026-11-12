import {Tooltip as BaseTooltip} from '@base-ui/react/tooltip';

import {mergeClassName} from '../utils/class-names.ts';

import styles from './tooltip.module.css';

export type {
  TooltipProviderProps,
  TooltipRootProps,
  TooltipRootActions,
  TooltipRootChangeEventReason,
  TooltipRootChangeEventDetails,
  TooltipTriggerProps,
  TooltipTriggerState,
  TooltipPortalProps,
  TooltipPositionerState,
  TooltipPopupState,
} from '@base-ui/react/tooltip';

export type TooltipHandle<Payload = unknown> = BaseTooltip.Handle<Payload>;

export type TooltipPositionerProps = BaseTooltip.Positioner.Props;
export type TooltipPopupProps = BaseTooltip.Popup.Props;

/** The default `sideOffset` keeps the tooltip clear of its trigger's focus ring. */
export function TooltipPositioner({
  ref,
  // The focus ring's width (borderWidth.focusRing, 2px) plus its outline offset (borderWidth.medium, 2px).
  sideOffset = 4,
  ...props
}: TooltipPositionerProps) {
  return <BaseTooltip.Positioner {...props} ref={ref} sideOffset={sideOffset} />;
}

export function TooltipPopup({ref, className, ...props}: TooltipPopupProps) {
  return (
    <BaseTooltip.Popup
      {...props}
      ref={ref}
      className={mergeClassName<BaseTooltip.Popup.State>(styles.popup, className)}
    />
  );
}
