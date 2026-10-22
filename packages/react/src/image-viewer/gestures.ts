// Gestures of a full-screen image, after PhotoSwipe and iOS Photos: pinch to zoom (1x to 4x, around the fingers'
// midpoint), pan a zoomed image (kept within its edges), double-tap to zoom in at the tap or back out; at 1x, a vertical
// drag dismisses (the image follows the finger and shrinks a little, the backdrop fades; released past a sixth of the
// screen or with a flick it flies out at the release's speed and closes, else it springs back), a horizontal swipe goes
// to the next or previous image. Pointer events with touch-action: none on the stage, so the page never zooms. The
// view (scale, x, y, the dismiss drag) is written to the image's transform and the backdrop's opacity directly, frame
// by frame; at rest the backdrop is left to the stylesheet, so the viewer's own fade applies to it.

type ImageView = {scale: number; x: number; y: number};

/** The most an image zooms, and the zoom a double tap goes to. */
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
/** Two taps this close in time (ms) and space (px) are a double tap. */
const DOUBLE_TAP_TIME = 300;
const DOUBLE_TAP_DISTANCE = 30;
/** A dismiss drag closes past this share of the stage's height, or faster than this (px/ms). */
const DISMISS_DISTANCE = 1 / 6;
const DISMISS_VELOCITY = 0.5;
/** A horizontal swipe (at 1x) changes the image past this distance (px). */
const SWIPE_DISTANCE = 50;
/** Movement (px) before a single finger is a drag, not a tap. */
const SLOP = 8;

export type ImageGestureHandlers = {
  /** The image the gestures move. */
  image: () => HTMLElement | null;
  /** The backdrop that fades as the image is dragged away. */
  backdrop: () => HTMLElement | null;
  onClose: () => void;
  /** A horizontal swipe at 1x: +1 next, -1 previous. */
  onSwipe: (direction: 1 | -1) => void;
  /** A single tap outside the image (not a drag, not the second of a double tap). */
  onTapOutside: () => void;
  /** The image is being dragged away (or zoomed): the viewer's controls give way. False once it is back at rest. */
  onDragging: (dragging: boolean) => void;
};

type Point = {x: number; y: number};
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const midpoint = (a: Point, b: Point): Point => ({x: (a.x + b.x) / 2, y: (a.y + b.y) / 2});

/** Attaches the gestures to `stage` (the full-screen area); returns the cleanup and a reset (for a new image). */
export function attachImageGestures(
  stage: HTMLElement,
  handlers: ImageGestureHandlers,
): {detach: () => void; reset: () => void} {
  let view: ImageView = {scale: 1, x: 0, y: 0};
  /** The vertical offset of a dismiss drag (px), at 1x. */
  let dismiss = 0;
  const pointers = new Map<number, Point>();
  let gesture:
    | {kind: 'pending'; start: Point; time: number; target: EventTarget | null}
    | {kind: 'pan'; start: Point; from: ImageView}
    | {
        kind: 'dismiss';
        start: Point;
        time: number;
        last: number;
        lastTime: number;
        velocity: number;
      }
    | {kind: 'swipe'; start: Point}
    | {kind: 'pinch'; startDistance: number; startMid: Point; from: ImageView}
    | undefined;
  let lastTap: {point: Point; time: number} | undefined;
  let frame = 0;

  /** The image's untransformed box, centred in the stage. */
  const base = () => {
    const image = handlers.image();
    return image ? {width: image.offsetWidth, height: image.offsetHeight} : {width: 0, height: 0};
  };
  /** Keeps a zoomed image covering the stage where it can: its edges never come inside the stage's. */
  const clamp = (next: ImageView): ImageView => {
    const {width, height} = base();
    const maxX = Math.max(0, (width * next.scale - stage.clientWidth) / 2);
    const maxY = Math.max(0, (height * next.scale - stage.clientHeight) / 2);
    return {
      scale: next.scale,
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    };
  };
  /** Draws the view; `animate` eases there over `duration` ms (a spring back, a zoom, or the flight out). */
  const render = (animate: boolean, duration = 280, easing = 'cubic-bezier(0.2, 0.9, 0.25, 1)') => {
    const image = handlers.image();
    const backdrop = handlers.backdrop();
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (image) {
        image.style.transition = animate ? `transform ${duration}ms ${easing}` : 'none';
        // Dragged away, the image shrinks a little as it goes.
        const shrink = 1 - Math.min(0.25, Math.abs(dismiss) / stage.clientHeight / 2);
        image.style.transform = `translate(${view.x}px, ${view.y + dismiss}px) scale(${view.scale * shrink})`;
      }
      if (!backdrop) return;
      // Undragged, the backdrop is the stylesheet's (a spring back eases there by its transition), so the viewer's
      // own fade in and out applies to it.
      if (!dismiss) {
        backdrop.style.removeProperty('transition');
        backdrop.style.removeProperty('opacity');
        return;
      }
      backdrop.style.transition = animate ? `opacity ${duration}ms ${easing}` : 'none';
      backdrop.style.opacity = String(
        1 - Math.min(1, Math.abs(dismiss) / (stage.clientHeight / 2)),
      );
    });
  };
  /** Zooms to `scale` keeping the stage point `at` (relative to the stage's centre) where it is on screen. */
  const zoomAround = (from: ImageView, scale: number, at: Point): ImageView => {
    const ratio = scale / from.scale;
    return {scale, x: at.x - (at.x - from.x) * ratio, y: at.y - (at.y - from.y) * ratio};
  };
  const centred = (point: Point): Point => {
    const box = stage.getBoundingClientRect();
    return {x: point.x - box.left - box.width / 2, y: point.y - box.top - box.height / 2};
  };

  const down = (event: PointerEvent) => {
    stage.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, {x: event.clientX, y: event.clientY});
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()] as [Point, Point];
      dismiss = 0;
      gesture = {
        kind: 'pinch',
        startDistance: distance(a, b) || 1,
        startMid: centred(midpoint(a, b)),
        from: view,
      };
      return;
    }
    if (pointers.size === 1)
      gesture = {
        kind: 'pending',
        start: {x: event.clientX, y: event.clientY},
        time: event.timeStamp,
        target: event.target,
      };
  };

  const move = (event: PointerEvent) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, {x: event.clientX, y: event.clientY});
    const point = {x: event.clientX, y: event.clientY};
    if (gesture?.kind === 'pinch' && pointers.size >= 2) {
      const [a, b] = [...pointers.values()] as [Point, Point];
      // Past the limits the zoom gives a little, then springs back on release.
      const raw = gesture.from.scale * (distance(a, b) / gesture.startDistance);
      const scale =
        raw > MAX_SCALE ? MAX_SCALE + (raw - MAX_SCALE) * 0.3 : raw < 1 ? 1 - (1 - raw) * 0.4 : raw;
      const mid = centred(midpoint(a, b));
      const zoomed = zoomAround(gesture.from, scale, gesture.startMid);
      view = {
        scale,
        x: zoomed.x + (mid.x - gesture.startMid.x),
        y: zoomed.y + (mid.y - gesture.startMid.y),
      };
      render(false);
      return;
    }
    if (gesture?.kind === 'pending') {
      const dx = point.x - gesture.start.x;
      const dy = point.y - gesture.start.y;
      if (Math.hypot(dx, dy) < SLOP) return;
      if (view.scale > 1.01) gesture = {kind: 'pan', start: gesture.start, from: view};
      else if (Math.abs(dy) > Math.abs(dx)) {
        handlers.onDragging(true);
        gesture = {
          kind: 'dismiss',
          start: gesture.start,
          time: event.timeStamp,
          last: point.y,
          lastTime: event.timeStamp,
          velocity: 0,
        };
      } else gesture = {kind: 'swipe', start: gesture.start};
    }
    if (gesture?.kind === 'pan') {
      view = clamp({
        scale: view.scale,
        x: gesture.from.x + point.x - gesture.start.x,
        y: gesture.from.y + point.y - gesture.start.y,
      });
      render(false);
    } else if (gesture?.kind === 'dismiss') {
      const elapsed = Math.max(1, event.timeStamp - gesture.lastTime);
      gesture.velocity = 0.8 * ((point.y - gesture.last) / elapsed) + 0.2 * gesture.velocity;
      gesture.last = point.y;
      gesture.lastTime = event.timeStamp;
      dismiss = point.y - gesture.start.y;
      render(false);
    }
  };

  const up = (event: PointerEvent) => {
    const point = pointers.get(event.pointerId) ?? {x: event.clientX, y: event.clientY};
    pointers.delete(event.pointerId);
    const done = gesture;
    if (done?.kind === 'pinch') {
      // One finger left: it carries on as a pan, from where the view is.
      if (pointers.size === 1) {
        const [left] = [...pointers.values()] as [Point];
        gesture = {kind: 'pan', start: left, from: view};
      } else gesture = undefined;
      view = clamp({...view, scale: Math.min(MAX_SCALE, Math.max(1, view.scale))});
      if (view.scale <= 1.01) view = {scale: 1, x: 0, y: 0};
      render(true);
      return;
    }
    if (pointers.size) return;
    gesture = undefined;
    if (done?.kind === 'dismiss') {
      const fast =
        Math.abs(event.timeStamp - done.lastTime) < 100 &&
        Math.abs(done.velocity) > DISMISS_VELOCITY;
      if (Math.abs(dismiss) > stage.clientHeight * DISMISS_DISTANCE || fast) {
        // Out the way it was going, at the release's speed (a flick finishes sooner), the backdrop fading with
        // it; closed once it is off the screen.
        const direction = Math.sign(dismiss || done.velocity);
        const rest = stage.clientHeight - Math.abs(dismiss);
        const speed = Math.max(Math.abs(done.velocity), 1.2);
        const duration = Math.min(320, Math.max(160, rest / speed));
        dismiss = direction * stage.clientHeight;
        render(true, duration, 'cubic-bezier(0.3, 0.6, 0.5, 1)');
        setTimeout(handlers.onClose, duration + 20);
        return;
      }
      dismiss = 0;
      render(true);
      handlers.onDragging(false);
      return;
    }
    if (done?.kind === 'swipe') {
      const dx = point.x - done.start.x;
      if (Math.abs(dx) > SWIPE_DISTANCE) handlers.onSwipe(dx < 0 ? 1 : -1);
      return;
    }
    if (done?.kind === 'pan') {
      render(true);
      return;
    }
    if (done?.kind === 'pending') {
      // A tap beside the image closes at once: only the image itself takes a double tap.
      if (done.target !== handlers.image()) {
        lastTap = undefined;
        if (view.scale <= 1.01) handlers.onTapOutside();
        return;
      }
      // On the image, the second of two taps is a double tap, which zooms in at it or back out.
      if (
        lastTap &&
        event.timeStamp - lastTap.time < DOUBLE_TAP_TIME &&
        distance(lastTap.point, point) < DOUBLE_TAP_DISTANCE
      ) {
        lastTap = undefined;
        view =
          view.scale > 1.01
            ? {scale: 1, x: 0, y: 0}
            : clamp(zoomAround(view, DOUBLE_TAP_SCALE, centred(point)));
        render(true);
        return;
      }
      lastTap = {point, time: event.timeStamp};
    }
  };

  const cancel = (event: PointerEvent) => {
    pointers.delete(event.pointerId);
    if (pointers.size) return;
    gesture = undefined;
    dismiss = 0;
    view = clamp({...view, scale: Math.max(1, view.scale)});
    render(true);
    handlers.onDragging(false);
  };
  // Safari's own pinch (gesture events) would zoom the page.
  const block = (event: Event) => event.preventDefault();

  stage.addEventListener('pointerdown', down);
  stage.addEventListener('pointermove', move);
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', cancel);
  stage.addEventListener('gesturestart', block);
  stage.addEventListener('gesturechange', block);
  return {
    detach: () => {
      cancelAnimationFrame(frame);
      stage.removeEventListener('pointerdown', down);
      stage.removeEventListener('pointermove', move);
      stage.removeEventListener('pointerup', up);
      stage.removeEventListener('pointercancel', cancel);
      stage.removeEventListener('gesturestart', block);
      stage.removeEventListener('gesturechange', block);
    },
    reset: () => {
      view = {scale: 1, x: 0, y: 0};
      dismiss = 0;
      render(false);
    },
  };
}
