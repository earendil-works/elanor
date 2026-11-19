import {mergeProps} from '@base-ui/react/merge-props';
import {useRender} from '@base-ui/react/use-render';
import type {MouseEvent, PointerEvent} from 'react';

import styles from './composer.module.css';

export interface ComposerPanelProps extends useRender.ComponentProps<'div'> {}

/**
 * The composer's visible wrapper: `Composer.Header`, `Composer.Field` and `Composer.Footer` in a
 * column. Renders a `div`; pass `render={<form />}` for a form. It fills its container's width,
 * also in a flex or grid container that would size it to its content. A size container named
 * `composer`, for `@container composer (…)` rules of your own. Hangs out of its container by
 * `--composer-hang`, none by default. Exposes `--composer-text-inset`, the distance from the
 * frame's edge to the text: `--composer-hang: var(--composer-text-inset)` lines the text up with
 * content around it. Set that on `Composer.Panel` itself (via `className`); a wrapper can't read
 * the inset. `--composer-footer-inset` sets how far the footer's control text sits inside the
 * frame without a hang.
 */
export function ComposerPanel({ref, render, ...props}: ComposerPanelProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({className: styles.panel}, props),
  });
}

export interface ComposerHeaderProps extends useRender.ComponentProps<'div'> {}

/**
 * The row above the field, as wide as its frame: notices, an error about the last message, the
 * message being replied to. It moves with the frame when Panel is hung; its content isn't aligned
 * to the text inset. Takes any number of children, stacked with a gap.
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
 * the finger, so a tap on Send only closed the keyboard. The click still happens. Runs on
 * mousedown, which browsers also fire after a tap and whose default moves the focus. Not on
 * pointerdown: cancelling that suppresses the mouse events a Dropdown's trigger opens on.
 */
function keepFocus(event: MouseEvent<HTMLDivElement>): void {
  // SAFETY: mouse events target elements, never text nodes.
  const target = event.target as Element;
  // A press in a popup that a control opened bubbles here through React, but isn't in the field.
  if (!event.currentTarget.contains(target) || target.closest(TEXT_ENTRY)) {
    return;
  }
  event.preventDefault();
}

/** The press timer of each field, so a second finger's press replaces the first one's. */
const pressTimers = new WeakMap<Element, ReturnType<typeof setTimeout>>();

/** `semantic.duration.press`: a tap shows at least this long, so it is seen. */
function pressDuration(element: Element): number {
  const token = getComputedStyle(element).getPropertyValue('--semantic-duration-press');
  return Number.parseFloat(token) * (token.trim().endsWith('ms') ? 1 : 1000) || 150;
}

/**
 * Sets `data-pressed` while a finger is on the field, and for a moment at least. Not for a press on
 * a button, which is the button's alone, in a popup opened from the field, or on text long enough
 * to scroll: iOS doesn't scroll when a touch starts on an element whose style changes.
 */
function showPress(event: PointerEvent<HTMLDivElement>): void {
  // SAFETY: pointer events target elements, never text nodes.
  const target = event.target as Element;
  const field = event.currentTarget;
  if (
    event.pointerType !== 'touch' ||
    !field.contains(target) ||
    target.closest('button, [role="button"]')
  ) {
    return;
  }
  for (let at: Element | null = target; at && at !== field; at = at.parentElement) {
    // One pixel of rounding between the two heights isn't scrolling.
    if (at.scrollHeight > at.clientHeight + 1 && getComputedStyle(at).overflowY !== 'visible') {
      return;
    }
  }
  const pointer = event.pointerId;
  const down = performance.now();
  const duration = pressDuration(field);
  clearTimeout(pressTimers.get(field));
  field.setAttribute('data-pressed', '');
  const release = (up: globalThis.PointerEvent) => {
    // Another finger lifting doesn't end this press.
    if (up.pointerId !== pointer) return;
    window.removeEventListener('pointerup', release);
    window.removeEventListener('pointercancel', release);
    pressTimers.set(
      field,
      setTimeout(
        () => field.removeAttribute('data-pressed'),
        Math.max(0, duration - (performance.now() - down)),
      ),
    );
  };
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
}

export interface ComposerFieldProps extends useRender.ComponentProps<'div'> {}

/**
 * The frame that looks like one text field: the attachments, the prompt and `Composer.Controls`. A
 * press on anything in it but the text keeps the focus where it is, so a phone's keyboard stays
 * up; presses in popups opened from it are left alone. Renders `data-pressed` while a finger is on
 * it, not on one of its buttons.
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

/** A row of controls in the field, in DOM order. Place them as you like. */
export function ComposerControls({ref, render, ...props}: ComposerControlsProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({className: styles.controls}, props),
  });
}

export interface ComposerFooterProps extends useRender.ComponentProps<'div'> {}

/**
 * The row below the field, for your own controls and figures, such as a model picker
 * and the context used. Takes any number of children and sets no text style of its own. Its first
 * and last controls' text sits `--composer-footer-inset` (2px) inside the frame, which suits ghost
 * controls, or, with Panel hung by the text inset, lines up with the field's text. When narrow,
 * Footer's children shrink and cut their text; give a child that must stay whole `flex: none`.
 */
export function ComposerFooter({ref, render, ...props}: ComposerFooterProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({className: styles.footer}, props),
  });
}
