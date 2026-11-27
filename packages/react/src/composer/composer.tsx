import {mergeProps} from '@base-ui/react/merge-props';
import {useRender} from '@base-ui/react/use-render';
import {AddIcon, ArrowUpwardIcon, StopIcon} from '@earendil-works/elanor-icons-react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';

import {IconButton, type IconButtonProps} from '../icon-button/icon-button.tsx';
import {useFieldRootContext} from '../utils/base-ui-internals.ts';
import {fieldValidityMapping} from '../utils/field-validity.ts';
import {useMergedRef} from '../utils/refs.ts';
import {useComposerMeta, useComposerSettings, useComposerStatus} from './context.ts';
import type {EditorBinding} from './editor/editor.ts';

import styles from './composer.module.css';

export interface ComposerPanelState {
  /** Nothing is written in the prompt. */
  readonly empty: boolean;
  readonly disabled: boolean;
  readonly readOnly: boolean;
}

export interface ComposerPanelProps extends useRender.ComponentProps<'div', ComposerPanelState> {}

/**
 * The composer's visible wrapper: `Composer.Header`, `Composer.InputGroup` and `Composer.Footer` in
 * a column. Renders a `div`; pass `render={<form />}` for a form, whose submit event calls Root's
 * `onSubmit`. It fills its container's width, also in a flex or grid container that would size it
 * to its content. A size container named `composer`, for `@container composer (…)` rules of your
 * own. Hangs out of its container by `--composer-hang`, none by default. Exposes
 * `--composer-text-inset`, the distance from the frame's edge to the text:
 * `--composer-hang: var(--composer-text-inset)` lines the text up with content around it. Set that
 * on `Composer.Panel` itself (via `className`); a wrapper can't read the inset.
 * `--composer-footer-inset` sets how far the footer's control text sits inside the frame without a
 * hang. Renders `data-empty`, `data-disabled` and `data-readonly`.
 */
export function ComposerPanel({ref, render, ...props}: ComposerPanelProps) {
  const meta = useComposerMeta('Composer.Panel');
  const status = useComposerStatus('Composer.Panel');
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    state: {...status},
    props: mergeProps<'div'>(
      {
        className: styles.panel,
        // Without `onSubmit`, the form submits as forms do.
        onSubmit: (event) => {
          if (!meta.takesSubmit()) return;
          event.preventDefault();
          meta.actions.submit(event.nativeEvent);
        },
      },
      props,
    ),
  });
}

export interface ComposerHeaderProps extends useRender.ComponentProps<'div'> {}

/**
 * The row above the input group, as wide as its frame: notices, an error about the last message,
 * the message being replied to. It moves with the frame when Panel is hung; its content isn't
 * aligned to the text inset. Takes any number of children, stacked with a gap.
 */
export function ComposerHeader({ref, render, ...props}: ComposerHeaderProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({className: styles.header}, props),
  });
}

// A read-only prompt isn't editable but is still text to select and focus; a disabled one isn't.
const TEXT_ENTRY = [
  'textarea',
  'input',
  'select',
  '[contenteditable]:not([contenteditable="false"])',
  '[role="textbox"][aria-readonly="true"]',
].join(', ');

/**
 * Keeps the focus where it is for a press on anything in the input group but its text. On a phone
 * the press would otherwise take the focus from the text, close the keyboard and move the page
 * under the finger, so a tap on Send only closed the keyboard. The click still happens. Runs on
 * mousedown, which browsers also fire after a tap and whose default moves the focus. Not on
 * pointerdown: cancelling that suppresses the mouse events a Dropdown's trigger opens on.
 */
function keepFocus(event: MouseEvent<HTMLDivElement>): void {
  // SAFETY: mouse events target elements, never text nodes.
  const target = event.target as Element;
  // A press in a popup that a control opened bubbles here through React, but isn't in the group.
  if (!event.currentTarget.contains(target) || target.closest(TEXT_ENTRY)) {
    return;
  }
  event.preventDefault();
}

/** The press timer of each input group, so a second finger's press replaces the first one's. */
const pressTimers = new WeakMap<Element, ReturnType<typeof setTimeout>>();

/** `semantic.duration.press`: a tap shows at least this long, so it is seen. */
function pressDuration(element: Element): number {
  const token = getComputedStyle(element).getPropertyValue('--semantic-duration-press');
  return Number.parseFloat(token) * (token.trim().endsWith('ms') ? 1 : 1000) || 150;
}

/**
 * Sets `data-pressed` while a finger is on the input group, and for a moment at least. Not for a
 * press on a button, which is the button's alone, in a popup opened from the input group, or on
 * text long enough to scroll: iOS doesn't scroll when a touch starts on an element whose style
 * changes.
 */
function showPress(event: PointerEvent<HTMLDivElement>): void {
  // SAFETY: pointer events target elements, never text nodes.
  const target = event.target as Element;
  const group = event.currentTarget;
  if (
    event.pointerType !== 'touch' ||
    !group.contains(target) ||
    target.closest('button, [role="button"]')
  ) {
    return;
  }
  for (let at: Element | null = target; at && at !== group; at = at.parentElement) {
    // One pixel of rounding between the two heights isn't scrolling.
    if (at.scrollHeight > at.clientHeight + 1 && getComputedStyle(at).overflowY !== 'visible') {
      return;
    }
  }
  const pointer = event.pointerId;
  const down = performance.now();
  const duration = pressDuration(group);
  clearTimeout(pressTimers.get(group));
  group.setAttribute('data-pressed', '');
  const release = (up: globalThis.PointerEvent) => {
    // Another finger lifting doesn't end this press.
    if (up.pointerId !== pointer) return;
    window.removeEventListener('pointerup', release);
    window.removeEventListener('pointercancel', release);
    pressTimers.set(
      group,
      setTimeout(
        () => group.removeAttribute('data-pressed'),
        Math.max(0, duration - (performance.now() - down)),
      ),
    );
  };
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
}

export interface ComposerInputGroupState {
  /** Nothing is written in the prompt. */
  readonly empty: boolean;
  readonly disabled: boolean;
  readonly readOnly: boolean;
  /** The validity of the `Field.Root` around the composer, `null` before it is validated. */
  readonly valid: boolean | null;
  /** Files that `onAttach` takes are dragged over the input group. */
  readonly dragOver: boolean;
}

/**
 * How long (ms) a file drag shows without a `dragover`, which browsers repeat while the pointer is
 * over the input group, also at rest: it ends a drag that left without a `dragleave`, as after
 * Escape.
 */
const DRAG_OVER_TIMEOUT_MS = 1000;

function useFileDrag(editor: EditorBinding) {
  const [dragOver, setDragOver] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (!dragOver) return undefined;
    // A drag from the page cancelled over the input group ends with `dragend`.
    const end = () => setDragOver(false);
    window.addEventListener('dragend', end, true);
    return () => {
      clearTimeout(timer.current);
      window.removeEventListener('dragend', end, true);
    };
  }, [dragOver]);
  const ref = useCallback(
    (group: HTMLElement | null) => {
      if (!group) return undefined;
      // Taking the drag hides the browser's drop caret under the pointer, which would show the
      // wrong place: files go in at the caret. `copy`: files are copied in, not moved.
      const onDragOver = (event: DragEvent) => {
        if (!editor.takesFiles(event)) return;
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
        setDragOver(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setDragOver(false), DRAG_OVER_TIMEOUT_MS);
      };
      // Moving onto a child also fires `dragleave`; only a point outside the group ends the drag.
      const onDragLeave = (event: DragEvent) => {
        const box = group.getBoundingClientRect();
        const {clientX: x, clientY: y} = event;
        if (x <= box.left || x >= box.right || y <= box.top || y >= box.bottom) setDragOver(false);
      };
      // Captured: React hands a drop on a chip, rendered through Root's portal, to the page's
      // handlers before it bubbles here. `preventDefault` tells the page's drop zones it's taken.
      const onDrop = (event: DragEvent) => {
        setDragOver(false);
        if (!event.defaultPrevented && editor.dropFiles(event)) event.preventDefault();
      };
      group.addEventListener('dragover', onDragOver);
      group.addEventListener('dragleave', onDragLeave);
      group.addEventListener('drop', onDrop, true);
      return () => {
        group.removeEventListener('dragover', onDragOver);
        group.removeEventListener('dragleave', onDragLeave);
        group.removeEventListener('drop', onDrop, true);
      };
    },
    [editor],
  );
  return {dragOver, ref};
}

const inputGroupStateMapping = {
  ...fieldValidityMapping,
  dragOver: (dragOver: boolean) => (dragOver ? {'data-drag-over': ''} : null),
};

export interface ComposerInputGroupProps extends useRender.ComponentProps<
  'div',
  ComposerInputGroupState
> {}

/**
 * The frame that looks like one text input: `Composer.Prompt` and `Composer.Controls`. A press on
 * anything in it but the text keeps the focus where it is, so a phone's keyboard stays up; presses
 * in popups opened from it are left alone. Files dropped anywhere on it go to `onAttach`, at the
 * caret. Renders `data-empty`, `data-disabled`, `data-readonly`, `data-pressed` while a finger is
 * on it, not on one of its buttons, and `data-drag-over` while files `onAttach` takes are dragged
 * over it, unstyled. Inside a `Field.Root` it also renders the field's `data-valid` or
 * `data-invalid`, unstyled, for your own styles.
 */
export function ComposerInputGroup({ref, render, ...props}: ComposerInputGroupProps) {
  const status = useComposerStatus('Composer.InputGroup');
  const {valid} = useFieldRootContext().state;
  const {editor} = useComposerMeta('Composer.InputGroup');
  const fileDrag = useFileDrag(editor);
  return useRender({
    defaultTagName: 'div',
    render,
    ref: ref ? [ref, fileDrag.ref] : fileDrag.ref,
    state: {...status, valid, dragOver: fileDrag.dragOver},
    stateAttributesMapping: inputGroupStateMapping,
    props: mergeProps<'div'>(
      {
        className: styles.inputGroup,
        onPointerDown: showPress,
        onMouseDown: keepFocus,
      },
      props,
    ),
  });
}

export interface ComposerControlsProps extends useRender.ComponentProps<'div'> {}

/** A row of controls in the input group, in DOM order. Place them as you like. */
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
 * The row below the input group, for your own controls and figures, such as a model picker and the
 * context used. Takes any number of children and sets no text style of its own. Its first and last
 * controls' text sits `--composer-footer-inset` (2px) inside the frame, which suits ghost controls,
 * or, with Panel hung by the text inset, lines up with the prompt's text. When narrow, Footer's
 * children shrink and cut their text; give a child that must stay whole `flex: none`.
 */
export function ComposerFooter({ref, render, ...props}: ComposerFooterProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({className: styles.footer}, props),
  });
}

export interface ComposerAttachProps extends Omit<IconButtonProps, 'density'> {
  /** The file types offered, as a file input's `accept`. */
  readonly accept?: string | undefined;
  /** Whether several files can be picked at once. */
  readonly multiple?: boolean | undefined;
  /** The camera to take a photo or video with on phones, as a file input's `capture`. */
  readonly capture?: boolean | 'user' | 'environment' | undefined;
  /** The icon. Defaults to a plus. */
  readonly children?: ReactNode;
}

/**
 * An `IconButton` with `density="default"` that opens the browser's file picker and passes the
 * picked files to Root's `onAttach`, with reason `picker`. Needs an `aria-label`. Disabled while
 * the composer is disabled or read-only.
 */
export function ComposerAttach({
  accept,
  multiple = true,
  capture,
  disabled = false,
  onClick,
  children = <AddIcon />,
  ...props
}: ComposerAttachProps) {
  const meta = useComposerMeta('Composer.Attach');
  const status = useComposerSettings('Composer.Attach');
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={input}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        capture={capture}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const files = [...(event.currentTarget.files ?? [])];
          // Picking the same file again is a change again.
          event.currentTarget.value = '';
          if (files.length) meta.pick(files, event.nativeEvent);
        }}
      />
      <IconButton
        {...props}
        density="default"
        disabled={disabled || status.disabled || status.readOnly}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) input.current?.click();
        }}
      >
        {children}
      </IconButton>
    </>
  );
}

export interface ComposerSubmitProps extends Omit<IconButtonProps, 'density' | 'hierarchy'> {
  /** The icon. Defaults to an upward arrow. */
  readonly children?: ReactNode;
}

/**
 * The send button: a primary `IconButton` with `density="default"`, labelled "Send". In a form it
 * submits the form; otherwise it calls Root's `onSubmit` with the click. Disabled while the
 * composer is disabled or read-only.
 */
export function ComposerSubmit({
  ref,
  disabled = false,
  onClick,
  children = <ArrowUpwardIcon />,
  ...props
}: ComposerSubmitProps) {
  const meta = useComposerMeta('Composer.Submit');
  const status = useComposerSettings('Composer.Submit');
  const handOff = useMergedRef(ref, meta.handOff);
  return (
    <IconButton
      aria-label="Send"
      {...props}
      ref={handOff}
      type="submit"
      density="default"
      hierarchy="primary"
      disabled={disabled || status.disabled || status.readOnly}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || event.currentTarget.form) return;
        meta.actions.submit(event.nativeEvent);
      }}
    >
      {children}
    </IconButton>
  );
}

export interface ComposerStopProps extends Omit<IconButtonProps, 'density' | 'hierarchy'> {
  /** The icon. Defaults to a square. */
  readonly children?: ReactNode;
}

/**
 * The button that stops a reply: a primary `IconButton` with `density="default"`, labelled "Stop".
 * Must be inside `Composer.Root`. Stop the reply in `onClick`; the composer doesn't know whether
 * one is running. Give it and `Composer.Submit` their own `key`s when one replaces the other; the
 * one that comes takes up the focus the other had.
 */
export function ComposerStop({ref, children = <StopIcon />, ...props}: ComposerStopProps) {
  const meta = useComposerMeta('Composer.Stop');
  const handOff = useMergedRef(ref, meta.handOff);
  return (
    <IconButton aria-label="Stop" {...props} ref={handOff} density="default" hierarchy="primary">
      {children}
    </IconButton>
  );
}
