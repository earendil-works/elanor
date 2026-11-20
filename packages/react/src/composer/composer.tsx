import {mergeProps} from '@base-ui/react/merge-props';
import {useRender} from '@base-ui/react/use-render';
import type {MouseEvent, PointerEvent} from 'react';

import styles from './composer.module.css';

export type ComposerAlign = 'frame' | 'text';

export interface ComposerPanelState {
  /** What lines up with the container's edges. */
  readonly align: ComposerAlign;
}

export interface ComposerPanelProps extends useRender.ComponentProps<'div', ComposerPanelState> {
  /** `frame` lines up the field's frame with the container; `text` lines up its text, the frame hanging out. */
  readonly align?: ComposerAlign;
}

/**
 * The composer's visible wrapper: `Composer.Header`, `Composer.Field` and `Composer.Footer` in a
 * column. Renders a `div`; pass `render={<form />}` for a form. With `align="text"` the container
 * needs room at its sides for the frame to hang into. Renders `data-align`.
 */
export function ComposerPanel({ref, render, align = 'frame', ...props}: ComposerPanelProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    state: {align},
    props: mergeProps<'div'>({className: styles.panel}, props),
  });
}

export interface ComposerHeaderProps extends useRender.ComponentProps<'div'> {}

/**
 * The row above the field, as wide as its frame: notices, an error about the last message, the
 * message being replied to. Takes any number of children, stacked with a gap.
 */
export function ComposerHeader({ref, render, ...props}: ComposerHeaderProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({className: styles.header}, props),
  });
}

const TEXT_ENTRY = 'textarea, input, select, [contenteditable]:not([contenteditable="false"])';

/**
 * Keeps the focus where it is for a press on anything in the field but its text. On a phone the
 * press would otherwise take the focus from the text, close the keyboard and move the page under
 * the finger, so a tap on Send only closed the keyboard. The click still happens. On the mouse's
 * press, which moves the focus also after a tap; not on the pointer's, which would suppress the
 * mouse events that controls such as a Dropdown's trigger open on.
 */
function keepFocus(event: MouseEvent<HTMLDivElement>): void {
  // Mouse events target elements, never text nodes.
  const target = event.target as Element;
  // A press in a popup that a control opened bubbles here through React, but isn't in the field.
  if (!event.currentTarget.contains(target) || target.closest(TEXT_ENTRY)) {
    return;
  }
  event.preventDefault();
}

/** A tap shows at least this long, so it is seen. */
const PRESSED_AT_LEAST_MS = 160;

/**
 * Sets `data-pressed` while a finger is on the field, and for a moment at least. Not for a press on
 * a button, which is the button's alone, nor on text long enough to scroll: iOS gives a scroll that
 * begins on a changing element to nothing.
 */
function showPress(event: PointerEvent<HTMLDivElement>): void {
  const target = event.target as Element;
  if (event.pointerType !== 'touch' || target.closest('button, [role="button"]')) {
    return;
  }
  const field = event.currentTarget;
  for (let at: Element | null = target; at && at !== field; at = at.parentElement) {
    // One pixel of rounding between the two heights isn't scrolling.
    if (at.scrollHeight > at.clientHeight + 1 && getComputedStyle(at).overflowY !== 'visible') {
      return;
    }
  }
  const down = performance.now();
  field.setAttribute('data-pressed', '');
  const release = () => {
    window.removeEventListener('pointerup', release);
    window.removeEventListener('pointercancel', release);
    setTimeout(
      () => field.removeAttribute('data-pressed'),
      Math.max(0, PRESSED_AT_LEAST_MS - (performance.now() - down)),
    );
  };
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
}

export interface ComposerFieldProps extends useRender.ComponentProps<'div'> {}

/**
 * The frame that looks like one text field: the attachments, the prompt and `Composer.Controls`. A
 * press on anything in it but the text keeps the focus where it is, so a phone's keyboard stays
 * up; presses in popups opened from it are left alone. On coarse pointers each `IconButton` with
 * `density="default"` keeps its touch target, which hangs over the field's padding and its
 * neighbours. Renders `data-pressed` while a finger is on it, not on one of its buttons.
 */
export function ComposerField({ref, render, ...props}: ComposerFieldProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>(
      {
        className: styles.field,
        onPointerDown: showPress,
        onMouseDown: keepFocus,
      },
      props,
    ),
  });
}

export interface ComposerControlsProps extends useRender.ComponentProps<'div'> {}

/**
 * The row of buttons at the bottom of the field, from the start. The child marked
 * `data-composer-submit` or `data-composer-stop`, or the `Composer.ControlGroup` holding one, sits
 * at the end: put it last. Use `IconButton`s with `density="default"`, whose icons line up with the
 * text.
 */
export function ComposerControls({ref, render, ...props}: ComposerControlsProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({className: styles.controls}, props),
  });
}

export interface ComposerControlGroupProps extends useRender.ComponentProps<'div'> {}

/** Controls in `Composer.Controls` that stay side by side, such as dictation and Send. */
export function ComposerControlGroup({ref, render, ...props}: ComposerControlGroupProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({className: styles.controlGroup}, props),
  });
}

export interface ComposerFooterProps extends useRender.ComponentProps<'div'> {}

/**
 * The row below the field, for the application's controls, such as a model picker, and
 * `Composer.Status` at its end. Sets `--semantic-typography-ui-primary` to the secondary text style,
 * so Elanor's controls in it are set in secondary text. The first control's text lines up with
 * what Panel aligns. In a narrow composer the row stays on one line: Status keeps its room and the
 * other children shrink, cut with an ellipsis.
 */
export function ComposerFooter({ref, render, ...props}: ComposerFooterProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({className: styles.footer}, props),
  });
}

export interface ComposerStatusProps extends useRender.ComponentProps<'div'> {}

/**
 * Figures at the end of `Composer.Footer`, such as the context used and the cost: `Meter`s and
 * `Composer.StatusItem`s, in any order. Tertiary text and tabular figures. A `Meter` in it gets a
 * short, thin track, and its indicator is grey unless its `semantic` is `warning` or `negative`.
 */
export function ComposerStatus({ref, render, ...props}: ComposerStatusProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({className: styles.status}, props),
  });
}

export interface ComposerStatusItemProps extends useRender.ComponentProps<'span'> {}

/** One short figure in `Composer.Status`. It may be a tooltip's trigger, and shows the focus then. */
export function ComposerStatusItem({ref, render, ...props}: ComposerStatusItemProps) {
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: mergeProps<'span'>({className: styles.statusItem}, props),
  });
}
