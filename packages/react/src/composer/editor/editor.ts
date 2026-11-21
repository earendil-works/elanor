// Derived from TokenInput in vercel-labs/ui (https://github.com/vercel-labs/ui), Copyright 2026
// Vercel, Inc., licensed under the Apache License, Version 2.0, and modified. See
// THIRD-PARTY-NOTICES in this package.
//
// What the browser is about to do, and what it did, turned into edits of the value. Typing at a
// caret goes through natively, so spelling, autocorrect and input methods keep working, and the
// input event reads it back; so do deletions within plain text. Everything that would touch a
// chip, new lines, paste, drop, cut and undo are cancelled and applied to the value, so one
// keystroke removes one chip in every engine and the history is the editor's.
import type {BaseUIChangeEventDetails} from '@base-ui/react/types';

import {announce} from '../../announce/announce.ts';
import {createChangeEventDetails} from '../../utils/change-event-details.ts';
import {isApple} from '../../utils/platform.ts';
import {type EditGroup, History} from './history.ts';
import {
  caretAt,
  chipAt,
  chipsOf,
  isChip,
  normalize,
  offsetOfChip,
  offsetText,
  type ComposerChip,
  type ComposerSegment,
  type ComposerValue,
  removedChips,
  replaceRange,
  sameValue,
  sliceValue,
  type ComposerTextRange,
  valueLength,
} from './model.ts';
import {EditorView, type Rect} from './view.ts';

/**
 * What Backspace or Delete does to an adjacent chip. `select`: the first press selects it, the
 * second removes it. `revert`: replaces it with its text, so suggestions reopen on it.
 */
export type ComposerChipDeletion = 'whole' | 'select' | 'revert';

/** Base UI's reason names where they exist; the rest follow their pattern. */
export type ComposerChangeReason =
  | 'input-change'
  | 'input-paste'
  | 'input-cut'
  | 'input-drop'
  | 'history-undo'
  | 'history-redo'
  | 'chip-remove-press'
  | 'item-press'
  | 'imperative-action'
  | 'form-reset';

/** `cancel()` keeps the previous value. */
export type ComposerChangeDetails<T extends ComposerChip> = BaseUIChangeEventDetails<
  ComposerChangeReason,
  {
    readonly removedChips: readonly T[];
  }
>;

/**
 * `enter`: Enter and Alt+Enter submit, Shift+Enter adds a line. `mod-enter`: Cmd/Ctrl+Enter and
 * Cmd/Ctrl+Alt+Enter submit, Enter adds a line.
 */
export type ComposerSubmitShortcut = 'enter' | 'mod-enter';

export interface ComposerSubmitDetails {
  /**
   * The `KeyboardEvent` (check `altKey` to give Alt+Enter its own action), a click, or a form's
   * submit event. `undefined` when `submit()` is called without one.
   */
  readonly event: Event | undefined;
}

export type ComposerAttachDetails =
  | {readonly reason: 'picker'; readonly event: Event}
  | {readonly reason: 'paste'; readonly event: ClipboardEvent}
  | {readonly reason: 'drop'; readonly event: DragEvent}
  | {readonly reason: 'api'; readonly event?: undefined};

/** One object for the editor's lifetime. It reads the latest options when called. */
export interface ComposerActions<T extends ComposerChip> {
  /** `at` defaults to `end`; `caret` restores the last caret. */
  focus(options?: {readonly at?: 'start' | 'end' | 'caret'}): void;
  blur(): void;
  /**
   * Inserts as one undo step. `caret` (the default) is the last known caret, also while the editor
   * is blurred. `startLine` prepends a line break unless the insert point starts a line. Commits
   * pending IME text first. Returns `false` when nothing changed.
   */
  insert(
    content: string | T | ComposerValue<T>,
    options?: {
      readonly at?: 'caret' | 'end' | ComposerTextRange;
      readonly startLine?: boolean;
      readonly reason?: 'imperative-action' | 'item-press';
    },
  ): boolean;
  undo(): void;
  redo(): void;
  /**
   * `historyKey` defaults to the current one. Undo then starts at the next value shown, such as the
   * empty value after sending.
   */
  clearHistory(historyKey?: string): void;
  submit(event?: Event): void;
  getValue(): ComposerValue<T>;
  /** Calls `onAttach` with reason `api`. */
  attach(files: File[]): void;
}

/** The editor without its chip type, for parts that read it from context. */
export interface EditorBinding {
  /** A React ref callback for the editable element. */
  bind(element: HTMLElement | null): (() => void) | undefined;
  /**
   * Call from the element's React `onKeyDown`, after the app's handler, with the native event.
   * Skips keys the app called `preventDefault()` on and keys during IME composition.
   */
  handleKeyDown(event: KeyboardEvent): void;
  removeChip(id: string, event: MouseEvent): void;
  /**
   * `null` unless focused with a collapsed selection. Chips appear as `CHIP_CHARACTER`. Includes
   * pending IME text.
   */
  textBeforeCaret(): string | null;
  caretRect(offset: number): Rect | null;
  element(): HTMLElement | null;
  /** Runs before the editor's own keys, such as for open suggestions. `true` prevents the key. */
  setKeyHandler(handler: ((event: KeyboardEvent) => boolean) | undefined): void;
  /** Fires on value, caret and focus changes, and during IME composition. */
  subscribe(listener: () => void): () => void;
  /** Fires on value changes only. `getValue` keeps its identity until then. */
  subscribeValue(listener: () => void): () => void;
  getValue(): ComposerValue<ComposerChip>;
}

export interface EditorOptions<T extends ComposerChip> {
  readonly onChange: (value: ComposerValue<T>, details: ComposerChangeDetails<T>) => void;
  /** Used for copied text and for `revert` chips. */
  readonly toText: (value: ComposerValue<T>) => string;
  readonly chipDeletion: ComposerChipDeletion | ((chip: T) => ComposerChipDeletion);
  /** Read by screen readers after the chip's label, such as "file". */
  readonly getChipDescription: (chip: T) => string;
  /** Without it, the submit shortcut adds a line. */
  readonly onSubmit:
    | ((value: ComposerValue<T>, details: ComposerSubmitDetails) => void)
    | undefined;
  readonly submitShortcut: ComposerSubmitShortcut;
  /** `false` when disabled or read-only. */
  readonly editable: boolean;
  /**
   * A paste or drop with files sends only the files: the text that comes with them is usually their
   * name or address. Without `onAttach`, the text is pasted.
   */
  readonly onAttach: ((files: File[], details: ComposerAttachDetails) => void) | undefined;
  /** Announced when chips are removed, joined into one message. Defaults to "Removed {label}". */
  readonly getChipRemovedMessage?: ((chip: T) => string) | undefined;
  /**
   * Announced when the first Backspace or Delete selects a `select` chip, or a press does. Defaults
   * to "{label}, {description}, selected. Press {key} to remove it".
   */
  readonly getChipSelectedMessage?: ((chip: T, key: 'Backspace' | 'Delete') => string) | undefined;
}

type SavedSelection = ComposerTextRange | null;
type Step<T extends ComposerChip> = {
  readonly value: ComposerValue<T>;
  readonly selection: SavedSelection;
};
type Edit<T extends ComposerChip> = {
  readonly value: ComposerValue<T>;
  readonly selection: SavedSelection;
  readonly group: EditGroup | undefined;
};

/** Per `historyKey`; the least recently shown is dropped first. */
const HISTORIES_KEPT = 20;

const escapeHtml = (text: string): string =>
  text.replace(/[&<>"]/g, (character) => `&#${character.charCodeAt(0)};`);
const CLIP = 'data-composer-clip';
// A copy's id is only compared with this editor's last copy. The counter keeps it unique in the
// page; the random part keeps it apart from copies other tabs left on the clipboard. Not
// `crypto.randomUUID()`: plain-http pages don't have it.
const CLIP_PAGE = Math.random().toString(36).slice(2, 10);
let clips = 0;

const granularity = (type: string): 'word' | 'lineboundary' | 'character' =>
  type.includes('Word') ? 'word' : type.includes('Line') ? 'lineboundary' : 'character';

/** Create one per `Composer.Root`. */
export class Editor<T extends ComposerChip> implements EditorBinding {
  /**
   * Root assigns it in a layout effect, not during render, then calls `show`. Events read the
   * latest.
   */
  options: EditorOptions<T>;
  /**
   * The value committed or shown last. Edits build on it, since a controlled value comes back only
   * once the owner renders.
   */
  #latest: ComposerValue<T>;
  /** Owner values by identity, normalized, so a value passed back keeps its normalized form. */
  readonly #normalized = new WeakMap<ComposerValue<T>, ComposerValue<T>>();
  readonly #histories = new Map<string, History<Step<T>>>();
  #historyKey: string;
  #history: History<Step<T>>;
  #edit: Edit<T> | undefined;
  #cleared = false;
  #element: HTMLElement | undefined;
  #view: EditorView<T> | undefined;
  #focused = false;
  /** A pointer press places its own caret, so focusing doesn't restore the last one. */
  #pressing = false;
  /** Where `insert` goes while the editor is blurred. */
  #selection: ComposerTextRange | null = null;
  #composing = false;
  /**
   * The chip selected for removal, kept while the caret stays at `caret`. Only an outline shows it,
   * with the caret collapsed: iOS draws a native range over a chip across the rest of the line,
   * with handles.
   */
  #armed: {readonly id: string; readonly caret: number} | undefined;
  /** Where the last typing or deletion left the caret. An edit anywhere else starts a new step. */
  #lastEnd = -1;
  #afterSpace = false;
  #dragged: ComposerTextRange | undefined;
  /** Pasting this copy back here restores its chips. */
  #clip: {readonly id: string; readonly value: ComposerValue<T>} | undefined;
  #keyHandler: ((event: KeyboardEvent) => boolean) | undefined;
  readonly #listeners = new Set<() => void>();
  readonly #valueListeners = new Set<() => void>();
  readonly #hostListeners = new Set<() => void>();
  #hosts: readonly {readonly chip: T; readonly content: HTMLElement}[] = [];

  constructor(options: EditorOptions<T>, owned: ComposerValue<T>, historyKey: string) {
    this.options = options;
    const value = this.#fromOwner(owned);
    this.#latest = value;
    this.#historyKey = historyKey;
    this.#history = new History<Step<T>>({value, selection: null});
    this.#histories.set(historyKey, this.#history);
  }

  bind = (element: HTMLElement | null): (() => void) | undefined => {
    if (!element) return undefined;
    this.#element = element;
    this.#view = new EditorView<T>(
      element,
      (chip) => this.options.getChipDescription(chip),
      () => {
        this.#hosts = this.#view?.hosts() ?? [];
        for (const listener of [...this.#hostListeners]) listener();
      },
    );
    this.#view.render(this.#latest);
    const unbind = this.#listen(element);
    return () => {
      unbind();
      this.#element = undefined;
      this.#view = undefined;
      this.#hosts = [];
      for (const listener of [...this.#hostListeners]) listener();
    };
  };

  /**
   * The owner portals `renderChip(chip)` into each `content`. The same array until hosts come or
   * go.
   */
  hosts = (): readonly {readonly chip: T; readonly content: HTMLElement}[] => this.#hosts;

  subscribeHosts = (listener: () => void): (() => void) => {
    this.#hostListeners.add(listener);
    return () => this.#hostListeners.delete(listener);
  };

  #fromOwner(owned: ComposerValue<T>): ComposerValue<T> {
    let value = this.#normalized.get(owned);
    if (!value) {
      const normalized = normalize(owned);
      value = sameValue(normalized, owned) ? owned : normalized;
      this.#normalized.set(owned, value);
    }
    return value;
  }

  /**
   * Root calls it after every render, so after every commit too: an edit a controlled owner didn't
   * take is replaced by the owner's value. Another `historyKey` switches to that key's history. A
   * value from outside, like a controlled reset after sending, is its own undo step; the value this
   * editor sent, passed back, isn't.
   */
  show(owned: ComposerValue<T>, historyKey: string): void {
    const value = this.#fromOwner(owned);
    if (historyKey !== this.#historyKey) {
      this.#historyKey = historyKey;
      this.#history =
        this.#histories.get(historyKey) ?? new History<Step<T>>({value, selection: null});
      // Map order is recency: re-insert, then drop from the front.
      this.#histories.delete(historyKey);
      this.#histories.set(historyKey, this.#history);
      for (const key of this.#histories.keys())
        if (this.#histories.size > HISTORIES_KEPT) this.#histories.delete(key);
      this.#edit = undefined;
      this.#armed = undefined;
      this.#selection = null;
      this.#lastEnd = -1;
    }
    const edit = this.#edit;
    this.#edit = undefined;
    if (!this.#cleared && edit && value === edit.value) {
      this.#history.record({value, selection: edit.selection}, edit.group);
      return;
    }
    if (value === this.#latest) return;
    const cleared = this.#cleared;
    this.#cleared = false;
    if (cleared) {
      this.#history = new History<Step<T>>({value, selection: null});
      this.#histories.set(historyKey, this.#history);
    } else if (!sameValue(value, this.#history.current().value))
      this.#history.record({value, selection: null});
    this.#latest = value;
    this.#render(null);
    this.#emitValue();
  }

  #render(selection: SavedSelection): void {
    this.#view?.render(this.#latest);
    if (selection && this.#focused) this.#view?.select(this.#clamp(selection));
  }

  #clamp({start, end}: ComposerTextRange): ComposerTextRange {
    const length = valueLength(this.#latest);
    return {start: Math.min(start, length), end: Math.min(end, length)};
  }

  /** The owner may cancel. Recorded in the history only once the owner shows the value back. */
  #commit(
    next: readonly ComposerSegment<T>[],
    selection: SavedSelection,
    reason: ComposerChangeReason,
    event: Event | undefined,
    {group, at, record = true}: {group?: EditGroup; at?: number; record?: boolean} = {},
  ): boolean {
    if (group && at !== undefined && at !== this.#lastEnd) this.#history.seal();
    const before = this.#latest;
    const value = normalize(next);
    if (sameValue(before, value)) {
      this.#render(selection);
      return false;
    }
    const removed = removedChips(before, value);
    const details: ComposerChangeDetails<T> = createChangeEventDetails(reason, event, undefined, {
      removedChips: removed,
    });
    this.options.onChange(value, details);
    if (details.isCanceled) {
      // A canceled edit the browser already made comes out of the DOM.
      this.#render(this.#view?.selection() ?? null);
      return false;
    }
    this.#latest = value;
    this.#edit = record ? {value, selection, group} : undefined;
    if (selection) this.#selection = selection;
    this.#lastEnd = group && selection ? selection.end : -1;
    this.#render(selection);
    if (removed.length && this.#element) {
      const message = this.options.getChipRemovedMessage ?? ((chip: T) => `Removed ${chip.label}`);
      // Joined, so several chips removed at once are one message.
      announce(removed.map(message).join('. '), this.#element);
    }
    this.#emitValue();
    return true;
  }

  /** For a form's reset event. */
  reset(value: ComposerValue<T>, event: Event): void {
    this.#armed = undefined;
    this.#commit(value, caretAt(valueLength(value)), 'form-reset', event);
  }

  #emit(): void {
    for (const listener of [...this.#listeners]) listener();
  }

  #emitValue(): void {
    for (const listener of [...this.#valueListeners]) listener();
    this.#emit();
  }

  #insert(
    content: readonly ComposerSegment<T>[],
    range: ComposerTextRange,
    event: Event | undefined,
    reason: ComposerChangeReason,
  ) {
    const next = replaceRange(this.#latest, range, content);
    const end = range.start + valueLength(normalize(content));
    return this.#commit(next, caretAt(end), reason, event);
  }

  #insertTyped(text: string, range: ComposerTextRange, event: InputEvent): void {
    // A new word starts a new undo step.
    if (this.#afterSpace && /\S/.test(text)) this.#history.seal();
    this.#afterSpace = /\s$/.test(text);
    this.#commit(
      replaceRange(this.#latest, range, [text]),
      caretAt(range.start + text.length),
      'input-change',
      event,
      {
        group: 'insert',
        at: range.start,
      },
    );
  }

  /** Reads native typing, deletions and IME text back from the DOM. */
  #readBack(event: InputEvent | undefined): void {
    const view = this.#view;
    if (!view) return;
    if (!this.options.editable) {
      view.render(this.#latest);
      return;
    }
    const next = view.read();
    const selection = view.selection() ?? caretAt(valueLength(normalize(next)));
    const deleting = event?.inputType.startsWith('delete') ?? false;
    const text = deleting ? '' : (event?.data ?? '');
    if (this.#afterSpace && /\S/.test(text)) this.#history.seal();
    if (text) this.#afterSpace = /\s$/.test(text);
    // A deletion starts at the last known caret, since the selection has already moved; typing
    // starts where its text does.
    const at = deleting ? (this.#selection?.end ?? selection.end) : selection.end - text.length;
    this.#commit(
      next,
      selection,
      'input-change',
      event,
      event ? {group: deleting ? 'delete' : 'insert', at} : {},
    );
  }

  #deletion(chip: T): ComposerChipDeletion {
    const {chipDeletion} = this.options;
    return typeof chipDeletion === 'function' ? chipDeletion(chip) : chipDeletion;
  }

  /**
   * `empty`: collapsed in the DOM. A range over zero-width spaces only has equal offsets but isn't
   * empty.
   */
  #targetOf(
    event: InputEvent,
  ): {readonly range: ComposerTextRange; readonly empty: boolean} | null {
    const [target] = event.getTargetRanges();
    const view = this.#view;
    if (!target || !view) return null;
    const start = view.offsetAt(target.startContainer, target.startOffset);
    const end = view.offsetAt(target.endContainer, target.endOffset);
    return {
      range: {start: Math.min(start, end), end: Math.max(start, end)},
      empty: target.collapsed,
    };
  }

  /**
   * The browser deletes plain text. The editor takes over when a chip is beside a collapsed caret
   * or inside the target range, or when only zero-width spaces are in the way.
   */
  #delete(event: InputEvent): void {
    const view = this.#view;
    const range = view?.selection();
    if (!view || !range) return;
    const type = event.inputType;
    // Cut and drag have events of their own.
    if (type === 'deleteByCut' || type === 'deleteByDrag') {
      event.preventDefault();
      return;
    }
    const take = (): boolean => {
      if (!event.cancelable) return false;
      event.preventDefault();
      this.#armed = undefined;
      return true;
    };
    if (range.start === range.end && /^delete(Content|Word)/.test(type)) {
      const neighbour = type.includes('Backward') ? range.start - 1 : range.start;
      const chip = chipAt(this.#latest, neighbour);
      if (chip && event.cancelable) {
        event.preventDefault();
        this.#removeChip(chip, neighbour, event);
        return;
      }
    }
    const target = this.#targetOf(event);
    if (!target) return;
    const reach = target.range;
    if (reach.start !== reach.end) {
      if (chipsOf(sliceValue(this.#latest, reach.start, reach.end)).length === 0) {
        this.#armed = undefined;
        return;
      }
      if (take()) this.#remove(reach, range, event);
      return;
    }
    // Only zero-width spaces are in the way: collapse to the caret and extend as far as the
    // browser's deletion would reach.
    if (target.empty || !take()) return;
    const selection = document.getSelection();
    if (!selection) return;
    view.select(range);
    selection.modify(
      'extend',
      type.includes('Backward') ? 'backward' : 'forward',
      granularity(type),
    );
    const extended = view.selection();
    if (extended && extended.start !== extended.end) this.#remove(extended, range, event);
  }

  #remove(reach: ComposerTextRange, from: ComposerTextRange, event: InputEvent): void {
    this.#commit(
      replaceRange(this.#latest, reach, []),
      caretAt(reach.start),
      'input-change',
      event,
      {
        group: 'delete',
        at: from.end,
      },
    );
  }

  #removeChip(chip: T, offset: number, event: InputEvent): void {
    const deletion = this.#deletion(chip);
    const range = {start: offset, end: offset + 1};
    if (deletion === 'select' && this.#armed?.id !== chip.id) {
      const backward = event.inputType.includes('Backward');
      this.#arm(chip, backward ? offset + 1 : offset, backward ? 'Backspace' : 'Delete');
      return;
    }
    this.#armed = undefined;
    const text = deletion === 'revert' ? this.options.toText([chip]) : '';
    this.#commit(
      replaceRange(this.#latest, range, [text]),
      caretAt(offset + text.length),
      'input-change',
      event,
    );
  }

  #arm(chip: T, caret: number, key: 'Backspace' | 'Delete'): void {
    this.#armed = {id: chip.id, caret};
    this.#view?.select(caretAt(caret));
    this.#selection = caretAt(caret);
    this.#markSelected(caretAt(caret));
    if (!this.#element) return;
    const {getChipSelectedMessage, getChipDescription} = this.options;
    const description = getChipDescription(chip);
    announce(
      getChipSelectedMessage?.(chip, key) ??
        `${chip.label}${description ? `, ${description}` : ''}, selected. Press ${key} to remove it`,
      this.#element,
    );
  }

  removeChip(id: string, event: MouseEvent): void {
    if (!this.options.editable) return;
    const offset = offsetOfChip(this.#latest, id);
    if (offset === undefined) return;
    this.#commit(
      replaceRange(this.#latest, {start: offset, end: offset + 1}, []),
      caretAt(offset),
      'chip-remove-press',
      event,
    );
  }

  #undo(
    event: Event | undefined,
    step: Step<T> | undefined,
    reason: 'history-undo' | 'history-redo',
  ): void {
    if (!step) return;
    this.#armed = undefined;
    this.#commit(step.value, step.selection ?? caretAt(valueLength(step.value)), reason, event, {
      record: false,
    });
  }

  #writeClipboard(data: DataTransfer | null, range: ComposerTextRange): void {
    if (!data) return;
    const value = sliceValue(this.#latest, range.start, range.end);
    const text = this.options.toText(value);
    const id = `${CLIP_PAGE}-${(clips += 1)}`;
    this.#clip = {id, value};
    data.setData('text/plain', text);
    data.setData('text/html', `<span ${CLIP}="${id}">${escapeHtml(text)}</span>`);
  }

  /**
   * A copy from this editor pastes back with its chips. Chips still in the value outside `range`
   * paste as text, since an id names one chip.
   */
  #readClipboard(data: DataTransfer | null, range: ComposerTextRange): ComposerSegment<T>[] {
    if (!data) return [];
    const clip = this.#clip;
    const pasted = new RegExp(`${CLIP}="([^"]+)"`).exec(data.getData('text/html'))?.[1];
    if (!clip || pasted !== clip.id) return [data.getData('text/plain').replace(/\r\n?/g, '\n')];
    const kept = new Set(chipsOf(replaceRange(this.#latest, range, [])).map((chip) => chip.id));
    return clip.value.map((segment) =>
      isChip(segment) && kept.has(segment.id) ? this.options.toText([segment]) : segment,
    );
  }

  #markSelected(range: ComposerTextRange): void {
    const ids = new Set(
      chipsOf(sliceValue(this.#latest, range.start, range.end)).map((chip) => chip.id),
    );
    if (this.#armed) ids.add(this.#armed.id);
    this.#view?.markSelected(ids);
  }

  textBeforeCaret(): string | null {
    const view = this.#focused ? this.#view : undefined;
    const range = view?.selection();
    if (!view || !range || range.start !== range.end) return null;
    return offsetText(
      sliceValue(this.#composing ? normalize(view.read()) : this.#latest, 0, range.start),
    );
  }

  caretRect(offset: number): Rect | null {
    return this.#view?.rectAt(offset) ?? null;
  }

  element(): HTMLElement | null {
    return this.#element ?? null;
  }

  subscribe = (listener: () => void): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  subscribeValue = (listener: () => void): (() => void) => {
    this.#valueListeners.add(listener);
    return () => this.#valueListeners.delete(listener);
  };

  getValue = (): ComposerValue<T> => this.#latest;

  setKeyHandler(handler: ((event: KeyboardEvent) => boolean) | undefined): void {
    this.#keyHandler = handler;
  }

  handleKeyDown = (event: KeyboardEvent): void => {
    // Safari sends the key that ends a composition after its end, as key 229.
    if (event.defaultPrevented || event.isComposing || this.#composing || event.keyCode === 229)
      return;
    if (this.#keyHandler?.(event)) {
      event.preventDefault();
      return;
    }
    const mod = isApple() ? event.metaKey : event.ctrlKey;
    const key = event.key.toLowerCase();
    if (mod && !event.altKey && key === 'z') {
      event.preventDefault();
      if (this.options.editable) (event.shiftKey ? this.actions.redo : this.actions.undo)();
      return;
    }
    if (!isApple() && event.ctrlKey && key === 'y') {
      event.preventDefault();
      if (this.options.editable) this.actions.redo();
      return;
    }
    if (
      (event.key === 'ArrowLeft' || event.key === 'ArrowRight') &&
      !event.shiftKey &&
      !mod &&
      !event.altKey
    ) {
      this.#crossChip(event);
      return;
    }
    if (mod && (key === 'b' || key === 'i' || key === 'u')) {
      event.preventDefault();
      return;
    }
    if (event.key === 'Enter') {
      const {onSubmit, submitShortcut} = this.options;
      // Alt is allowed with either shortcut; the app reads `event.altKey`.
      const submits = !event.shiftKey && (submitShortcut === 'enter' ? !mod : mod);
      if (!submits || !onSubmit) return;
      event.preventDefault();
      onSubmit(this.#latest, {event});
    }
  };

  /**
   * An arrow next to a chip moves past it in one press. The anchors around a host are caret stops
   * of their own to the browser, which would cost one more.
   */
  #crossChip(event: KeyboardEvent): void {
    const view = this.#view;
    const range = view?.selection();
    if (!view || !this.#element || !range || range.start !== range.end) return;
    const forward =
      (event.key === 'ArrowRight') !== (getComputedStyle(this.#element).direction === 'rtl');
    const target = forward ? range.end : range.start - 1;
    if (!chipAt(this.#latest, target)) return;
    event.preventDefault();
    view.select(caretAt(forward ? target + 1 : target));
  }

  readonly actions: ComposerActions<T> = {
    focus: ({at = 'end'} = {}) => {
      const element = this.#element;
      if (!element) return;
      element.focus({preventScroll: true});
      const length = valueLength(this.#latest);
      const caret =
        at === 'start'
          ? caretAt(0)
          : at === 'end'
            ? caretAt(length)
            : (this.#selection ?? caretAt(length));
      this.#view?.select(this.#clamp(caret));
    },
    blur: () => this.#element?.blur(),
    insert: (content, {at = 'caret', startLine = false, reason = 'imperative-action'} = {}) => {
      if (!this.options.editable) return false;
      // Commit pending IME text before inserting beside it.
      if (this.#composing) {
        this.#composing = false;
        this.#readBack(undefined);
      }
      const length = valueLength(this.#latest);
      const range =
        at === 'end' ? caretAt(length) : at === 'caret' ? (this.#selection ?? caretAt(length)) : at;
      const given = typeof content === 'string' || 'id' in content ? [content] : content;
      const before = offsetText(sliceValue(this.#latest, 0, range.start));
      const segments =
        startLine && before !== '' && !before.endsWith('\n') ? ['\n', ...given] : given;
      return this.#insert(segments, range, undefined, reason);
    },
    undo: () => this.#undo(undefined, this.#history.undo(), 'history-undo'),
    redo: () => this.#undo(undefined, this.#history.redo(), 'history-redo'),
    clearHistory: (historyKey = this.#historyKey) => {
      if (historyKey !== this.#historyKey) {
        this.#histories.delete(historyKey);
        return;
      }
      // The owner may clear the history before showing the value it starts from, such as when
      // sending, so the next value shown starts it.
      this.#history = new History<Step<T>>({value: this.#latest, selection: null});
      this.#histories.set(historyKey, this.#history);
      this.#edit = undefined;
      this.#cleared = true;
    },
    submit: (event) => this.options.onSubmit?.(this.#latest, {event}),
    getValue: () => this.#latest,
    attach: (files) => this.options.onAttach?.(files, {reason: 'api'}),
  };

  #listen(element: HTMLElement): () => void {
    const view = (): EditorView<T> | undefined => this.#view;

    const onBeforeInput = (event: InputEvent) => {
      const type = event.inputType;
      if (!this.options.editable) {
        event.preventDefault();
        return;
      }
      if (type === 'historyUndo' || type === 'historyRedo') {
        event.preventDefault();
        if (type === 'historyUndo') this.actions.undo();
        else this.actions.redo();
        return;
      }
      // Also during IME composition: deleting a chip beside it is the editor's job.
      if (type.startsWith('delete')) {
        this.#delete(event);
        return;
      }
      // Composition is never cancelled: the input method owns it until it ends.
      if (type === 'insertCompositionText' || this.#composing) return;
      const range = view()?.selection();
      if (!range) return;
      if (type === 'insertText' || type === 'insertReplacementText') {
        const text = event.data ?? event.dataTransfer?.getData('text/plain') ?? '';
        const target = this.#targetOf(event)?.range ?? range;
        // Typing at a caret in text goes through, so the input event reads it.
        if (
          type === 'insertText' &&
          target.start === target.end &&
          !view()?.inHost(document.getSelection()?.anchorNode ?? null)
        )
          return;
        event.preventDefault();
        this.#insertTyped(text, target, event);
        return;
      }
      event.preventDefault();
      if (type === 'insertParagraph' || type === 'insertLineBreak')
        this.#insertTyped('\n', range, event);
      // Paste, drop and cut have events of their own. Formatting and anything else stays out.
      else if (type === 'insertFromYank') this.#insertTyped(event.data ?? '', range, event);
    };

    const onInput = (event: Event) => {
      const input = event instanceof InputEvent ? event : undefined;
      // IME text is read back at `compositionend`. Listeners still get each update, for
      // suggestions.
      if (this.#composing || input?.isComposing) {
        this.#emit();
        return;
      }
      this.#readBack(input);
    };

    const onCopy = (event: ClipboardEvent) => {
      const range = view()?.selection();
      if (!range || range.start === range.end) return;
      event.preventDefault();
      this.#writeClipboard(event.clipboardData, range);
    };

    const onCut = (event: ClipboardEvent) => {
      const range = view()?.selection();
      if (!range || range.start === range.end) return;
      event.preventDefault();
      if (!this.options.editable) return;
      this.#writeClipboard(event.clipboardData, range);
      this.#commit(replaceRange(this.#latest, range, []), caretAt(range.start), 'input-cut', event);
    };

    /** `true` when files went to `onAttach`. */
    const takeFiles = (data: DataTransfer | null, details: ComposerAttachDetails): boolean => {
      const files = [...(data?.files ?? [])];
      if (!files.length || !this.options.onAttach) return false;
      this.options.onAttach(files, details);
      return true;
    };

    const onPaste = (event: ClipboardEvent) => {
      event.preventDefault();
      const range = view()?.selection();
      if (
        !range ||
        !this.options.editable ||
        takeFiles(event.clipboardData, {reason: 'paste', event})
      )
        return;
      const content = this.#readClipboard(event.clipboardData, range);
      if (!content.some((segment) => segment !== '')) return;
      this.#insert(content, range, event, 'input-paste');
    };

    const onDragStart = (event: DragEvent) => {
      const range = view()?.selection();
      if (!range || range.start === range.end) return;
      this.#dragged = range;
      this.#writeClipboard(event.dataTransfer, range);
    };

    const onDragEnd = () => {
      this.#dragged = undefined;
    };

    const onDragOver = (event: DragEvent) => {
      // Accept a file drop only when `onAttach` takes the files.
      if (this.options.onAttach && event.dataTransfer?.types.includes('Files'))
        event.preventDefault();
    };

    const onDrop = (event: DragEvent) => {
      event.preventDefault();
      const source = this.#dragged;
      this.#dragged = undefined;
      const current = view();
      if (
        !this.options.editable ||
        !current ||
        takeFiles(event.dataTransfer, {reason: 'drop', event})
      )
        return;
      const point = pointFrom(event);
      let at = point ? current.offsetAt(point[0], point[1]) : valueLength(this.#latest);
      let value = this.#latest;
      // A drag inside the editor moves the text, unless it's dropped onto itself or Ctrl or Alt
      // copies it.
      if (source && !(event.ctrlKey || event.altKey)) {
        if (at > source.start && at < source.end) return;
        value = replaceRange(value, source, []);
        if (at >= source.end) at -= source.end - source.start;
      }
      const content = source
        ? sliceValue(this.#latest, source.start, source.end)
        : this.#readClipboard(event.dataTransfer, caretAt(at));
      const next = replaceRange(value, caretAt(at), content);
      this.#commit(next, caretAt(at + valueLength(normalize(content))), 'input-drop', event);
    };

    // A press on a chip of the focused editor selects it, with the caret collapsed after it: a
    // native range would make iOS draw a highlight with handles across the line. The keyboard stays
    // up. The remove button handles its own press.
    const onPointerDown = (event: PointerEvent) => {
      this.#pressing = true;
      const current = view();
      if (
        !current ||
        !this.#focused ||
        !this.options.editable ||
        !(event.target instanceof Element)
      )
        return;
      const host = event.target.closest<HTMLElement>('[data-chip-id]');
      if (!host || event.target.closest('[data-chip-remove]')) return;
      const offset = offsetOfChip(this.#latest, host.dataset.chipId ?? '');
      if (offset === undefined) return;
      const chip = chipAt(this.#latest, offset);
      if (!chip) return;
      event.preventDefault();
      this.#arm(chip, offset + 1, 'Backspace');
    };

    const onCompositionStart = () => {
      this.#composing = true;
    };

    // The committed text is read back as one step of its own.
    const onCompositionEnd = () => {
      this.#composing = false;
      this.#readBack(undefined);
    };

    // A caret inside a chip's host moves to its edge, and the chips in the selection are marked.
    const onSelectionChange = () => {
      const selection = document.getSelection();
      const current = view();
      if (!current || !selection?.rangeCount || !element.contains(selection.anchorNode)) return;
      const range = current.selection();
      if (!range) return;
      if (current.inHost(selection.anchorNode) || current.inHost(selection.focusNode))
        current.select(range);
      if (this.#armed && !(range.start === range.end && range.start === this.#armed.caret))
        this.#armed = undefined;
      this.#selection = range;
      this.#markSelected(range);
      this.#emit();
    };

    // Focus from Tab or code restores the last caret; a pointer press places its own.
    const onFocus = () => {
      const restore = !this.#pressing;
      this.#pressing = false;
      this.#focused = true;
      if (restore && this.#selection) view()?.select(this.#clamp(this.#selection));
      this.#emit();
    };

    // A dropped `compositionend` can't leave the editor stuck composing.
    const onBlur = () => {
      this.#focused = false;
      this.#pressing = false;
      this.#composing = false;
      this.#armed = undefined;
      this.#view?.markSelected(new Set());
      this.#emit();
    };

    const stops: (() => void)[] = [];
    const on = <K extends keyof HTMLElementEventMap>(
      type: K,
      listener: (event: HTMLElementEventMap[K]) => void,
    ) => {
      element.addEventListener(type, listener);
      stops.push(() => element.removeEventListener(type, listener));
    };
    on('beforeinput', onBeforeInput);
    on('input', onInput);
    on('copy', onCopy);
    on('cut', onCut);
    on('paste', onPaste);
    on('dragstart', onDragStart);
    on('dragend', onDragEnd);
    on('dragover', onDragOver);
    on('drop', onDrop);
    on('pointerdown', onPointerDown);
    on('compositionstart', onCompositionStart);
    on('compositionend', onCompositionEnd);
    on('focus', onFocus);
    on('blur', onBlur);
    document.addEventListener('selectionchange', onSelectionChange);
    stops.push(() => document.removeEventListener('selectionchange', onSelectionChange));
    if (document.activeElement === element) onFocus();
    return () => {
      for (const stop of stops) stop();
    };
  }
}

function pointFrom(event: DragEvent): [Node, number] | null {
  const position = document.caretPositionFromPoint?.(event.clientX, event.clientY);
  if (position) return [position.offsetNode, position.offset];
  const range = document.caretRangeFromPoint?.(event.clientX, event.clientY);
  return range ? [range.startContainer, range.startOffset] : null;
}
