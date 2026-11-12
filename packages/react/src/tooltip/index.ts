import {Tooltip as BaseTooltip} from '@base-ui/react/tooltip';

export {TooltipPositioner as Positioner, TooltipPopup as Popup} from './tooltip.tsx';

export const Provider = BaseTooltip.Provider;
export const Root = BaseTooltip.Root;
export const Trigger = BaseTooltip.Trigger;
export const Portal = BaseTooltip.Portal;
export const createHandle = BaseTooltip.createHandle;
