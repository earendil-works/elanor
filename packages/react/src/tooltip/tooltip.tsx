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

/**
 * Places the tooltip next to its trigger, above it by default, and moves it to stay in view. The
 * default `sideOffset` keeps it clear of the trigger's focus ring, which the tooltip would
 * otherwise cover while the trigger has keyboard focus. It is the ring's width,
 * `semantic.dimension.borderWidth.focusRing` (2px), plus its outline offset,
 * `semantic.dimension.borderWidth.medium` (2px); change it when they change.
 */
export function TooltipPositioner({ref, sideOffset = 4, ...props}: TooltipPositionerProps) {
  return <BaseTooltip.Positioner {...props} ref={ref} sideOffset={sideOffset} />;
}

/**
 * The tooltip's text, in secondary UI type on the canvas and border of Elanor's popovers, with
 * compact padding.
 */
export function TooltipPopup({ref, className, ...props}: TooltipPopupProps) {
  return (
    <BaseTooltip.Popup
      {...props}
      ref={ref}
      className={mergeClassName<BaseTooltip.Popup.State>(styles.popup, className)}
    />
  );
}
