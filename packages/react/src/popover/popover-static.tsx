import type {Popover as BasePopover} from '@base-ui/react/popover';
import {
  createContext,
  useContext,
  useId,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './popover.module.css';

interface StaticPopoverContextValue {
  readonly positionerId: string;
  readonly titleId: string;
  readonly descriptionId: string;
}

const StaticPopoverContext = /* @__PURE__ */ createContext<StaticPopoverContextValue | null>(null);

function useStaticPopover(part: string): StaticPopoverContextValue {
  const popover = useContext(StaticPopoverContext);
  if (!popover) throw new Error(`Popover.${part} must be inside Popover.StaticRoot.`);
  return popover;
}

export interface PopoverStaticRootProps {
  readonly children?: ReactNode;
}

/**
 * A popover for pages without React in the browser; `createPopover` makes it work. Renders no
 * element.
 */
export function PopoverStaticRoot({children}: PopoverStaticRootProps) {
  const id = useId();
  return (
    <StaticPopoverContext.Provider
      value={{
        positionerId: `${id}-positioner`,
        titleId: `${id}-title`,
        descriptionId: `${id}-description`,
      }}
    >
      {children}
    </StaticPopoverContext.Provider>
  );
}

export interface PopoverStaticTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly ref?: Ref<HTMLButtonElement> | undefined;
}

export function PopoverStaticTrigger({ref, ...props}: PopoverStaticTriggerProps) {
  const {positionerId} = useStaticPopover('StaticTrigger');
  return (
    <button
      type="button"
      {...props}
      ref={ref}
      aria-haspopup="dialog"
      aria-expanded={false}
      popoverTarget={positionerId}
    />
  );
}

export interface PopoverStaticPositionerProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
  readonly side?: Extract<BasePopover.Positioner.Props['side'], 'top' | 'bottom'>;
  readonly align?: BasePopover.Positioner.Props['align'];
  readonly sideOffset?: Extract<BasePopover.Positioner.Props['sideOffset'], number>;
}

/** The popover in the top layer, placed next to the trigger. Holds the `StaticPopup`. */
export function PopoverStaticPositioner({
  ref,
  side = 'bottom',
  align = 'center',
  sideOffset = 0,
  style,
  ...props
}: PopoverStaticPositionerProps) {
  const {positionerId} = useStaticPopover('StaticPositioner');
  return (
    <div
      {...props}
      ref={ref}
      id={positionerId}
      popover="auto"
      data-elanor="popover"
      data-side={side}
      data-align={align}
      data-elanor-side-offset={sideOffset}
      // The browser's popover box, without its frame; the popup draws the frame.
      style={{padding: 0, border: 0, background: 'none', overflow: 'visible', ...style}}
    />
  );
}

export interface PopoverStaticPopupProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

export function PopoverStaticPopup({ref, className, ...props}: PopoverStaticPopupProps) {
  const {titleId, descriptionId} = useStaticPopover('StaticPopup');
  return (
    <div
      role="dialog"
      tabIndex={-1}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      {...props}
      ref={ref}
      data-closed=""
      className={classes(styles.popup, className)}
    />
  );
}

export interface PopoverStaticTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  readonly ref?: Ref<HTMLHeadingElement> | undefined;
}

export function PopoverStaticTitle({ref, className, children, ...props}: PopoverStaticTitleProps) {
  const {titleId} = useStaticPopover('StaticTitle');
  return (
    <h2 {...props} ref={ref} id={titleId} className={classes(styles.title, className)}>
      {children}
    </h2>
  );
}

export interface PopoverStaticDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  readonly ref?: Ref<HTMLParagraphElement> | undefined;
}

export function PopoverStaticDescription({
  ref,
  className,
  ...props
}: PopoverStaticDescriptionProps) {
  const {descriptionId} = useStaticPopover('StaticDescription');
  return (
    <p {...props} ref={ref} id={descriptionId} className={classes(styles.description, className)} />
  );
}

export interface PopoverStaticCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly ref?: Ref<HTMLButtonElement> | undefined;
}

export function PopoverStaticClose({ref, ...props}: PopoverStaticCloseProps) {
  const {positionerId} = useStaticPopover('StaticClose');
  return (
    <button
      type="button"
      {...props}
      ref={ref}
      popoverTarget={positionerId}
      popoverTargetAction="hide"
    />
  );
}
