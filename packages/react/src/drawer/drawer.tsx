import {Drawer as BaseDrawer} from '@base-ui/react/drawer';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type Ref,
} from 'react';

import {mergeClassName} from '../utils/class-names.ts';

import styles from './drawer.module.css';
import {attachSheetDrag} from './sheet-drag.ts';

export type {
  DrawerRootActions,
  DrawerRootChangeEventReason,
  DrawerRootChangeEventDetails,
  DrawerRootSnapPointChangeEventReason,
  DrawerRootSnapPointChangeEventDetails,
  DrawerTriggerProps,
  DrawerTriggerState,
  DrawerPortalProps,
  DrawerCloseProps,
  DrawerCloseState,
  DrawerContentProps,
} from '@base-ui/react/drawer';

export type DrawerHandle<Payload = unknown> = BaseDrawer.Handle<Payload>;

interface SheetContextValue {
  /** Whether the popup handles drag to close itself: a bottom sheet without snap points. */
  drag: boolean;
  close: () => void;
  backdrop: () => HTMLElement | null;
  setBackdrop: (element: HTMLElement | null) => void;
  /** Runs `callback` once each close has finished (to clear the drag's offset); returns the unsubscribe. */
  onClosed: (callback: () => void) => () => void;
}

export const SheetContext = /* @__PURE__ */ createContext<SheetContextValue | null>(null);

/** The popup element, for parts that listen to gestures on it (Drawer.Stack's swipe back). */
export const PopupContext = /* @__PURE__ */ createContext<HTMLElement | null>(null);

function setRef<Value>(ref: Ref<Value> | undefined, value: Value | null) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

export type DrawerRootProps<Payload = unknown> = BaseDrawer.Root.Props<Payload>;

/**
 * Groups the drawer's parts and holds its open state. A bottom sheet without snap points is dragged away through a
 * rubber band: it closes past a share of its height or on a clear flick, and otherwise springs back.
 */
export function DrawerRoot<Payload = unknown>({
  actionsRef,
  onOpenChangeComplete,
  ...props
}: DrawerRootProps<Payload>) {
  const actions = useRef<BaseDrawer.Root.Actions | null>(null);
  useImperativeHandle(
    actionsRef,
    () => ({
      unmount: () => actions.current?.unmount(),
      close: () => actions.current?.close(),
    }),
    [],
  );
  const backdrop = useRef<HTMLElement | null>(null);
  const closed = useRef(new Set<() => void>());
  const drag = (props.swipeDirection ?? 'down') === 'down' && !props.snapPoints;
  const context = useMemo<SheetContextValue>(
    () => ({
      drag,
      close: () => actions.current?.close(),
      backdrop: () => backdrop.current,
      setBackdrop: (element) => {
        backdrop.current = element;
      },
      onClosed: (callback) => {
        const callbacks = closed.current;
        callbacks.add(callback);
        return () => callbacks.delete(callback);
      },
    }),
    [drag],
  );
  return (
    <SheetContext value={context}>
      <BaseDrawer.Root
        {...props}
        actionsRef={actions}
        onOpenChangeComplete={(open) => {
          if (!open) {
            for (const callback of closed.current) {
              callback();
            }
          }
          onOpenChangeComplete?.(open);
        }}
      />
    </SheetContext>
  );
}
export type DrawerSnapPoint = BaseDrawer.Root.SnapPoint;

export type DrawerBackdropProps = BaseDrawer.Backdrop.Props;
export type DrawerBackdropState = BaseDrawer.Backdrop.State;

export function DrawerBackdrop({ref, className, ...props}: DrawerBackdropProps) {
  const sheet = useContext(SheetContext);
  const backdropRef = useCallback(
    (element: HTMLDivElement | null) => {
      sheet?.setBackdrop(element);
      setRef(ref, element);
    },
    [sheet, ref],
  );
  return (
    <BaseDrawer.Backdrop
      {...props}
      ref={backdropRef}
      className={mergeClassName<BaseDrawer.Backdrop.State>(styles.backdrop, className)}
    />
  );
}

export type DrawerViewportProps = BaseDrawer.Viewport.Props;
export type DrawerViewportState = BaseDrawer.Viewport.State;

export function DrawerViewport({ref, className, ...props}: DrawerViewportProps) {
  return (
    <BaseDrawer.Viewport
      {...props}
      ref={ref}
      className={mergeClassName<BaseDrawer.Viewport.State>(styles.viewport, className)}
    />
  );
}

export type DrawerPopupProps = BaseDrawer.Popup.Props;
export type DrawerPopupState = BaseDrawer.Popup.State;

/**
 * The drawer's panel. A bottom sheet (`swipeDirection="down"`) shows a grip at its top edge, a cue to drag it away.
 */
export function DrawerPopup({ref, className, children, ...props}: DrawerPopupProps) {
  const sheet = useContext(SheetContext);
  const [popup, setPopup] = useState<HTMLDivElement | null>(null);
  const popupRef = useCallback(
    (element: HTMLDivElement | null) => {
      setPopup(element);
      setRef(ref, element);
    },
    [ref],
  );
  useEffect(() => {
    if (!popup || !sheet?.drag) {
      return undefined;
    }
    const detach = attachSheetDrag(popup, {backdrop: sheet.backdrop, close: sheet.close});
    const unsubscribe = sheet.onClosed(() => {
      popup.style.removeProperty('--drawer-drag');
      sheet.backdrop()?.style.removeProperty('--drawer-drag-progress');
    });
    return () => {
      detach();
      unsubscribe();
    };
  }, [popup, sheet]);
  return (
    <BaseDrawer.Popup
      {...props}
      ref={popupRef}
      // Base UI's own swipe stays out of a sheet that handles drag to close itself.
      {...(sheet?.drag ? {'data-base-ui-swipe-ignore': ''} : {})}
      className={mergeClassName<BaseDrawer.Popup.State>(styles.popup, className)}
    >
      <span className={styles.grip} aria-hidden="true" />
      <PopupContext value={popup}>{children}</PopupContext>
    </BaseDrawer.Popup>
  );
}

export type DrawerTitleProps = BaseDrawer.Title.Props;

export function DrawerTitle({ref, className, ...props}: DrawerTitleProps) {
  return (
    <BaseDrawer.Title
      {...props}
      ref={ref}
      className={mergeClassName<BaseDrawer.Title.State>(styles.title, className)}
    />
  );
}

export type DrawerDescriptionProps = BaseDrawer.Description.Props;

export function DrawerDescription({ref, className, ...props}: DrawerDescriptionProps) {
  return (
    <BaseDrawer.Description
      {...props}
      ref={ref}
      className={mergeClassName<BaseDrawer.Description.State>(styles.description, className)}
    />
  );
}
