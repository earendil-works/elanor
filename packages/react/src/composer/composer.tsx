import {mergeProps} from '@base-ui/react/merge-props';
import {useRender} from '@base-ui/react/use-render';
import {AddIcon, ArrowUpwardIcon, StopIcon} from '@earendil-works/elanor-icons-react';
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
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
 * The composer's visible wrapper: `Composer.Header`, `Composer.Field` and `Composer.Footer` in a
 * column. Renders a `div`; pass `render={<form />}` for a form, whose submit event calls Root's
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

// A read-only prompt isn't editable but is still text to select and focus; a disabled one isn't.
const TEXT_ENTRY = [
  'textarea',
  'input',
  'select',
  '[contenteditable]:not([contenteditable="false"])',
  '[role="textbox"][aria-readonly="true"]',
].join(', ');

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

export interface ComposerFieldState {
  /** Nothing is written in the prompt. */
  readonly empty: boolean;
  readonly disabled: boolean;
  readonly readOnly: boolean;
  /** The validity of the `Field.Root` around the composer, `null` before it is validated. */
  readonly valid: boolean | null;
  /** Files that `onAttach` takes are dragged over the field. */
  readonly dragOver: boolean;
}

/**
 * How long (ms) a file drag shows without a `dragover`, which browsers repeat while the pointer is
 * over the field, also at rest. Ends a drag whose `dragleave` didn't say it left, as after Escape.
 */
const DRAG_OVER_TIMEOUT_MS = 1000;

/** Files dropped anywhere on the field go to `onAttach`; `dragOver` while they're over it. */
function useFileDrag(editor: EditorBinding) {
  const [dragOver, setDragOver] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const stop = () => {
    clearTimeout(timer.current);
    setDragOver(false);
  };
  useEffect(() => {
    if (!dragOver) return undefined;
    // A drag from the page that is cancelled over the field ends here.
    const end = () => {
      clearTimeout(timer.current);
      setDragOver(false);
    };
    window.addEventListener('dragend', end, true);
    return () => {
      clearTimeout(timer.current);
      window.removeEventListener('dragend', end, true);
    };
  }, [dragOver]);
  return {
    dragOver,
    props: {
      onDragOver: (event: DragEvent<HTMLDivElement>) => {
        if (!editor.takesFiles(event.nativeEvent)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        setDragOver(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(stop, DRAG_OVER_TIMEOUT_MS);
      },
      // Moving onto a child leaves its parent too; only a point off the field leaves it.
      onDragLeave: (event: DragEvent<HTMLDivElement>) => {
        const box = event.currentTarget.getBoundingClientRect();
        const {clientX: x, clientY: y} = event;
        if (x <= box.left || x >= box.right || y <= box.top || y >= box.bottom) stop();
      },
      // The prompt takes its own drops first.
      onDrop: (event: DragEvent<HTMLDivElement>) => {
        stop();
        if (!event.defaultPrevented && editor.dropFiles(event.nativeEvent)) event.preventDefault();
      },
    },
  };
}

const fieldStateMapping = {
  ...fieldValidityMapping,
  dragOver: (dragOver: boolean) => (dragOver ? {'data-drag-over': ''} : null),
};

export interface ComposerFieldProps extends useRender.ComponentProps<'div', ComposerFieldState> {}

/**
 * The frame that looks like one text field: `Composer.Prompt` and `Composer.Controls`. A press on
 * anything in it but the text keeps the focus where it is, so a phone's keyboard stays up; presses
 * in popups opened from it are left alone. Files dropped anywhere on it go to `onAttach`, at the
 * caret. Renders `data-empty`, `data-disabled`, `data-readonly`, `data-pressed` while a finger is
 * on it, not on one of its buttons, and `data-drag-over` while files `onAttach` takes are dragged
 * over it, unstyled. Inside a `Field.Root` it also renders the field's `data-valid` or
 * `data-invalid`, unstyled, for your own styles.
 */
export function ComposerField({ref, render, ...props}: ComposerFieldProps) {
  const status = useComposerStatus('Composer.Field');
  const {valid} = useFieldRootContext().state;
  const {editor} = useComposerMeta('Composer.Field');
  const fileDrag = useFileDrag(editor);
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    state: {...status, valid, dragOver: fileDrag.dragOver},
    stateAttributesMapping: fieldStateMapping,
    props: mergeProps<'div'>(
      {
        className: styles.field,
        onPointerDown: showPress,
        onMouseDown: keepFocus,
        ...fileDrag.props,
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

export interface ComposerAttachProps extends Omit<IconButtonProps, 'density'> {
  /** The file types offered, as a file input's `accept`. */
  readonly accept?: string | undefined;
  /** Whether several files can be picked at once. */
  readonly multiple?: boolean | undefined;
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
