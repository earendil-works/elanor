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
  normalize,
  offsetOfChip,
  offsetText,
  type ComposerChip,
  type ComposerSegment,
  type ComposerValue,
  removedChips,
  replaceRange,
  sameContent,
  sameValue,
  sliceValue,
  type ComposerTextRange,
  valueLength,
  withNewIds,
} from './model.ts';
import {withSpaces} from './spacing.ts';
import {EditorView, type Rect} from './view.ts';

/**
 * What Backspace or Delete does to an adjacent chip. `whole`: removes it. `select`: the first press
 * selects it, the second removes it; while suggestions are open, the first removes it. `revert`:
 * replaces it with its text, so suggestions reopen on it. A selected chip, by an arrow, a press or
 * a first Backspace, is removed whole.
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
  | 'item-press'
  | 'list-navigation'
  | 'imperative-action'
  | 'form-reset';

/** `first-line`: ArrowUp recalls from anywhere on the first line. `empty`: only from an empty prompt. */
export type ComposerRecallFrom = 'first-line' | 'empty';

/** `cancel()` keeps the previous value. */
export type ComposerChangeDetails<T extends ComposerChip = ComposerChip> = BaseUIChangeEventDetails<
  ComposerChangeReason,
  {
    readonly removedChips: readonly T[];
  }
>;

/**
 * `enter`: Enter or Alt+Enter without Shift, Ctrl or Meta submits, and Shift+Enter adds a line.
 * `mod-enter`: Cmd/Ctrl+Enter or Cmd/Ctrl+Alt+Enter without Shift submits, and Enter adds a line.
 * Any other Enter is left to the browser.
 */
export type ComposerSubmitShortcut = 'enter' | 'mod-enter';

export interface ComposerSubmitDetails {
  /**
   * The `KeyboardEvent` (check `altKey` to give Alt+Enter its own action), a click, or a form's
   * submit event. `undefined` when `submit()` is called without one.
   */
  readonly event: Event | undefined;
}

export interface ComposerPasteDetails {
  readonly event: ClipboardEvent;
}

type AttachSource =
  | {readonly reason: 'picker'; readonly event: Event}
  | {readonly reason: 'paste'; readonly event: ClipboardEvent}
  | {readonly reason: 'drop'; readonly event: DragEvent}
  | {readonly reason: 'api'; readonly event?: undefined};

export type ComposerAttachDetails<T extends ComposerChip = ComposerChip> = AttachSource & {
  /** Where the files go: the selection a paste replaces, else the caret after any selected text. */
  readonly at: ComposerTextRange;
  /** Inserts at `at`, spaced, as one undo step; `false` once the text changed or if canceled. */
  readonly insert: (content: string | T | ComposerValue<T>) => boolean;
};

/**
 * Where `insert` puts its content, and why: the change details carry `reason` and `event`. A picked
 * suggestion (`item-press`), a drop (`input-drop`) and a paste (`input-paste`) always have their
 * event behind them.
 */
export type ComposerInsertOptions = {
  readonly at?: 'caret' | 'end' | ComposerTextRange;
  readonly startLine?: boolean;
  /**
   * For an insert a person made: adds a space at either edge, and between two chips, where the
   * text needs one, as in `Hi` + `there` or `fail?` + a chip, but not after `(` or before `.`.
   * Never next to a script written without spaces. Drops a space you pass where it would double
   * or start the prompt.
   */
  readonly space?: boolean;
} & (
  | {readonly reason?: 'imperative-action'; readonly event?: Event}
  | {
      readonly reason: 'item-press';
      readonly event: BaseUIChangeEventDetails<'item-press'>['event'];
    }
  | {readonly reason: 'input-drop'; readonly event: DragEvent}
  | {readonly reason: 'input-paste'; readonly event: ClipboardEvent}
);

/** One object for the editor's lifetime. It reads the latest options when called. */
export interface ComposerActions<T extends ComposerChip = ComposerChip> {
  /** `at` defaults to `end`; `caret` restores the last caret. */
  focus(options?: {readonly at?: 'start' | 'end' | 'caret'}): void;
  blur(): void;
  /**
   * Inserts as one undo step. `caret` (the default) is the last known caret, also while the editor
   * is blurred. `startLine` prepends a line break unless the insert point starts a line. Commits
   * pending IME text first. Returns `false` when nothing changed. Inserts exactly `content`; set
   * `space: true` for an insert a person made, such as a suggestion pick.
   */
  insert(content: string | T | ComposerValue<T>, options?: ComposerInsertOptions): boolean;
  undo(): void;
  redo(): void;
  /**
   * `historyKey` defaults to the current one. Undo then starts at the next value shown, such as the
   * empty value after sending.
   */
  clearHistory(historyKey?: string): void;
  /** Calls `onSubmit` without the keyboard's checks (composing, open suggestions). */
  submit(event?: Event): void;
  getValue(): ComposerValue<T>;
  /** Calls `onAttach` (reason `api`) at the caret after selected text; ignores an empty list. */
  attach(files: File[]): void;
  /** Whether the focused caret, with nothing selected or composing, is on the first or last line. */
  atEdge(edge: 'up' | 'down'): boolean;
}

/** The editor without its chip type, for parts that read it from context. */
export interface EditorBinding {
  /**
   * A React ref callback for the editable element. While a chip is armed for removal, the element
   * has `data-chip-armed` and the chip's host keeps `data-selected`. While chips are dragged, their
   * hosts have `data-dragging`.
   */
  bind(element: HTMLElement | null): (() => void) | undefined;
  /**
   * Call from the element's React `onKeyDown`, after the `onKeyDown` prop's handler, with the
   * native event. Skips keys that handler called `preventDefault()` on and keys during IME
   * composition.
   */
  handleKeyDown(event: KeyboardEvent): void;
  /** Whether the chip is in the selection or armed for removal. Changes fire `subscribe`. */
  isChipSelected(id: string): boolean;
  /**
   * `null` unless focused with a collapsed selection. Chips appear as `CHIP_CHARACTER`. While an
   * input method composes, it reads the DOM, since the value gets the text only at
   * `compositionend` and Android keyboards compose nearly every word.
   */
  textBeforeCaret(): string | null;
  caretRect(offset: number): Rect | null;
  element(): HTMLElement | null;
  /**
   * Set while a list at the caret is open, such as suggestions: it runs before the editor's own
   * keys, and `true` prevents the key. Meanwhile no chip is selected: the arrows move past a chip,
   * Backspace and Delete remove a `select` chip at once (a `revert` chip still turns into its
   * text), and a selected chip is dropped when the list opens.
   */
  setKeyHandler(handler: ((event: KeyboardEvent) => boolean) | undefined): void;
  /** Whether a drag carries files `onAttach` takes; a drag from this editor never does. */
  takesFiles(event: DragEvent): boolean;
  /** Gives dropped files to `onAttach`, at the caret after any selected text; `true` if taken. */
  dropFiles(event: DragEvent): boolean;
  /**
   * For `useSuggestionMatch`: fires on value, caret and focus changes, and during IME
   * composition.
   */
  subscribe(listener: () => void): () => void;
  /** For `useValue`: fires on value changes only. `getValue` keeps its identity until then. */
  subscribeValue(listener: () => void): () => void;
  getValue(): ComposerValue<ComposerChip>;
  /**
   * For `useRecall`: a plain ArrowUp on the first line shows the message before the one shown, or
   * the newest; a plain ArrowDown on the last line the one after, or the draft from before the
   * recall. Skips messages equal to the text. Not in a prompt that isn't editable, with a list at
   * the caret open or while composing. `true` when it took the key.
   */
  recallKey(
    event: KeyboardEvent,
    messages: readonly ComposerValue<ComposerChip>[],
    from: ComposerRecallFrom,
  ): boolean;
  /**
   * Whether the text is a recalled message nobody changed since. Suggestions stay closed on it.
   * Changes fire `subscribe`.
   */
  recalling(): boolean;
}

export interface EditorOptions<T extends ComposerChip> {
  /** Chips repeating an earlier chip's id arrive with a new id (see `ComposerChip`). */
  readonly onChange: (value: ComposerValue<T>, details: ComposerChangeDetails<T>) => void;
  /** Used for copied text and for `revert` chips. */
  readonly toText: (value: ComposerValue<T>) => string;
  readonly chipDeletion: ComposerChipDeletion | ((chip: T) => ComposerChipDeletion);
  /** Read by screen readers after the chip's label, such as "file". */
  readonly getChipDescription: (chip: T) => string;
  /**
   * Called for the submit shortcut, except while an input method composes (including Safari's key
   * 229 after it) or the key handler takes Enter, such as open suggestions; and for `submit()`.
   * `submit()` skips those checks and submits empty values too; check the value in `onSubmit`.
   * Without it, the submit shortcut adds a line.
   */
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
  readonly onAttach: ((files: File[], details: ComposerAttachDetails<T>) => void) | undefined;
  /**
   * The value pasted text goes in as, such as a chip for a long text. Not called for a copy from
   * this editor, whose chips come back, for files, or for Cmd/Ctrl+Shift+V, which pastes text as
   * text. When it returns more than the text, Undo first gives the text as text.
   */
  readonly getPastedValue:
    | ((text: string, details: ComposerPasteDetails) => ComposerValue<T>)
    | undefined;
  /** Announced when chips are removed, joined into one message. Defaults to "Removed {label}". */
  readonly getChipRemovedMessage: ((chip: T) => string) | undefined;
  /**
   * Announced when the first Backspace or Delete selects a `select` chip, or a press does. Defaults
   * to "{label}, {description}, selected. Press {key} to remove it".
   */
  readonly getChipSelectedMessage: ((chip: T, key: 'Backspace' | 'Delete') => string) | undefined;
}

type SavedSelection = ComposerTextRange | null;
type Armed = {readonly id: string; readonly caret: number};
type ChipHost<T extends ComposerChip> = {readonly chip: T; readonly content: HTMLElement};
type Step<T extends ComposerChip> = {
  readonly value: ComposerValue<T>;
  readonly selection: SavedSelection;
};
/**
 * A message recalled, as given, where it was in the messages and as shown, and the draft from
 * before the first recall. It shows while `shown` is the value.
 */
type Recall<T extends ComposerChip> = {
  readonly message: ComposerValue<ComposerChip>;
  readonly index: number;
  readonly shown: ComposerValue<T>;
  readonly draft: ComposerValue<T>;
};
type Edit<T extends ComposerChip> = {
  readonly value: ComposerValue<T>;
  readonly selection: SavedSelection;
  readonly group: EditGroup | undefined;
  /** A step recorded before this edit's own, as a paste's text before what it became. */
  readonly prior: Step<T> | undefined;
};

/** Per `historyKey`; the least recently shown is dropped first. */
const HISTORIES_KEPT = 20;

const escapeHtml = (text: string): string =>
  text.replace(/[&<>"]/g, (character) => `&#${character.charCodeAt(0)};`);
const CLIP = 'data-composer-clip';
// The random part keeps this page's copies apart from those other tabs left on the clipboard.
const CLIP_PAGE = Math.random().toString(36).slice(2, 10);
let clips = 0;

const granularity = (type: string): 'word' | 'lineboundary' | 'character' =>
  type.includes('Word') ? 'word' : type.includes('Line') ? 'lineboundary' : 'character';

/** Create one per `Composer.Root`. */
export class Editor<T extends ComposerChip> implements EditorBinding {
  #options: EditorOptions<T>;
  /**
   * The value committed or shown last. Edits build on it, since a controlled value comes back only
   * once the controlling component renders.
   */
  #latest: ComposerValue<T>;
  /** Values given to `show` by identity, normalized, so a value passed back keeps its form. */
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
  /** The last press's `pointerType`: a finger's starts no drag. */
  #pressedBy = '';
  /** The chip a press other than a finger's hit in the focused editor, selected at the click. */
  #pressedChip: string | undefined;
  /** Where `insert` goes while the editor is blurred. */
  #selection: ComposerTextRange | null = null;
  /**
   * Bumped when `#latest`'s content or draft changes, so `details.insert` knows its offsets still
   * hold. Not compared by identity: a parent's equal copy keeps them, a draft sharing one doesn't.
   */
  #revision = 0;
  #composing = false;
  /**
   * The chip selected for removal, kept while the caret stays at `caret`. Only its information fill
   * shows it, with the caret collapsed: iOS draws a native range over a chip across the rest of the
   * line, with handles.
   */
  #armedChip: Armed | undefined;
  get #armed() {
    return this.#armedChip;
  }
  // Mirrored on the element, so the Composer's CSS can hide the caret beside the armed chip.
  set #armed(armed: Armed | undefined) {
    this.#armedChip = armed;
    this.#element?.toggleAttribute('data-chip-armed', armed !== undefined);
  }
  /** Where the last typing or deletion left the caret. An edit anywhere else starts a new step. */
  #lastEnd = -1;
  #afterSpace = false;
  #dragged: ComposerTextRange | undefined;
  /** Cmd/Ctrl+Shift+V is down: the next paste is text as text. */
  #plainPaste = false;
  /** Pasting this copy back here restores its chips. */
  #clip: {readonly id: string; readonly value: ComposerValue<T>} | undefined;
  #keyHandler: ((event: KeyboardEvent) => boolean) | undefined;
  #recall: Recall<T> | undefined;
  readonly #listeners = new Set<() => void>();
  readonly #valueListeners = new Set<() => void>();
  readonly #hostListeners = new Set<() => void>();
  #hosts: readonly ChipHost<T>[] = [];
  /** The chips in the selection and the armed one, as `data-selected` shows them. */
  #selected: ReadonlySet<string> = new Set();
  /** Renamed copies by source chip and id, so a value with duplicates normalizes to equal chips. */
  readonly #renamed = new WeakMap<T, Map<string, T>>();

  constructor(options: EditorOptions<T>, given: ComposerValue<T>, historyKey: string) {
    this.#options = options;
    const value = this.#normalizeGiven(given);
    this.#latest = value;
    this.#historyKey = historyKey;
    this.#history = new History<Step<T>>({value, selection: null});
    this.#histories.set(historyKey, this.#history);
  }

  /** The latest, which events read. */
  get options(): EditorOptions<T> {
    return this.#options;
  }

  /** Root calls it in a layout effect, not during render, then calls `show`. */
  setOptions(options: EditorOptions<T>): void {
    this.#options = options;
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
      this.#armed = undefined;
      this.#element = undefined;
      this.#view = undefined;
      this.#hosts = [];
      for (const listener of [...this.#hostListeners]) listener();
    };
  };

  /**
   * Root portals `renderChip(chip)` into each `content`. The same array until hosts come or
   * go.
   */
  hosts = (): readonly ChipHost<T>[] => this.#hosts;

  /** For Root's chip portals: fires when hosts come or go. */
  subscribeHosts = (listener: () => void): (() => void) => {
    this.#hostListeners.add(listener);
    return () => this.#hostListeners.delete(listener);
  };

  #rename = (chip: T, id: string): T => {
    let byId = this.#renamed.get(chip);
    if (!byId) {
      byId = new Map();
      this.#renamed.set(chip, byId);
    }
    let renamed = byId.get(id);
    if (!renamed) {
      renamed = {...chip, id};
      byId.set(id, renamed);
    }
    return renamed;
  };

  #normalizeGiven(given: ComposerValue<T>): ComposerValue<T> {
    let value = this.#normalized.get(given);
    if (!value) {
      const normalized = normalize(given, this.#rename);
      value = sameValue(normalized, given) ? given : normalized;
      this.#normalized.set(given, value);
    }
    return value;
  }

  /**
   * Root calls it after every render, and must re-render on every commit, even when the
   * controlling component ignores the change (with a state tick in `onChange`, say): only then is
   * an edit it didn't take replaced by its value. Another `historyKey` switches to that key's
   * history.
   * A value from outside, like a controlled reset after sending, is its own undo step; the value
   * this editor sent, passed back, isn't.
   */
  show(given: ComposerValue<T>, historyKey: string): void {
    const value = this.#normalizeGiven(given);
    if (historyKey !== this.#historyKey) this.#switchHistory(historyKey, value);
    const edit = this.#edit;
    this.#edit = undefined;
    // The controlling component took the pending edit: it enters the history now, also the one
    // after `clearHistory` when no value from outside came between.
    if (edit && value === edit.value) {
      this.#cleared = false;
      if (edit.prior) this.#history.record(edit.prior);
      this.#history.record({value, selection: edit.selection}, edit.group);
      return;
    }
    // Nothing new, such as a render for something else.
    if (value === this.#latest) return;
    if (this.#cleared) {
      // The first value after `clearHistory` starts the new history.
      this.#cleared = false;
      this.#history = new History<Step<T>>({value, selection: null});
      this.#histories.set(historyKey, this.#history);
    } else if (!sameValue(value, this.#history.current().value)) {
      // A value from outside: a reset, a draft, or the controlling component's value in place of
      // an edit it didn't take. It's an undo step of its own.
      this.#history.record({value, selection: null});
    }
    this.#armed = undefined;
    if (!sameValue(value, this.#latest)) this.#revision += 1;
    this.#latest = value;
    this.#render(null);
    this.#emitValue();
  }

  /** Takes up `historyKey`'s history where it was left, or starts one at `value`. */
  #switchHistory(historyKey: string, value: ComposerValue<T>): void {
    // A recall there ends, and the message stays that draft.
    this.#history.seal();
    this.#recall = undefined;
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
    this.#revision += 1;
  }

  #render(selection: SavedSelection): void {
    this.#view?.render(this.#latest);
    if (selection && this.#focused) this.#view?.select(this.#clamp(selection));
  }

  #clamp({start, end}: ComposerTextRange): ComposerTextRange {
    const length = valueLength(this.#latest);
    return {start: Math.min(start, length), end: Math.min(end, length)};
  }

  /**
   * `onChange` may cancel.
   *
   * Undo steps: an edit enters the history only once Root shows it back (`show`). Typing and
   * deleting (`group` `insert` and `delete`) join the open step of their group while each edit
   * starts where the last one ended (`at` and `#lastEnd`) within `GROUP_PAUSE`. Typing joins one
   * step until a new word starts after a space (`#afterSpace`). `seal()` closes the open step.
   * Recalled messages (`group` `recall`) replace one another in one step until another edit.
   * Every other edit (paste, drop, cut, one key on a chip, `insert`, an input method's commit, a
   * form reset) is a step of its own; a paste `getPastedValue` changed records its text as the
   * step before it (`prior`). Undo and redo move through the history without recording.
   */
  #commit(
    next: readonly ComposerSegment<T>[],
    selection: SavedSelection,
    reason: ComposerChangeReason,
    event: Event | undefined,
    {
      group,
      at,
      record = true,
      prior,
    }: {group?: EditGroup; at?: number; record?: boolean; prior?: Step<T> | undefined} = {},
  ): boolean {
    if (group && at !== undefined && at !== this.#lastEnd) this.#history.seal();
    const before = this.#latest;
    const value = normalize(next, this.#rename);
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
    this.#armed = undefined;
    this.#latest = value;
    this.#revision += 1;
    this.#edit = record ? {value, selection, group, prior} : undefined;
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
    prior?: Step<T> | undefined,
  ) {
    const next = replaceRange(this.#latest, range, content);
    const end = range.start + valueLength(content);
    return this.#commit(next, caretAt(end), reason, event, {prior});
  }

  #insertTyped(text: string, range: ComposerTextRange, event: InputEvent): void {
    // A new word starts a new undo step (see "Undo steps" on `#commit`).
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
    const selection = view.selection() ?? caretAt(valueLength(next));
    const deleting = event?.inputType.startsWith('delete') ?? false;
    const text = deleting ? '' : (event?.data ?? '');
    // See "Undo steps" on `#commit`.
    if (this.#afterSpace && /\S/.test(text)) this.#history.seal();
    if (text) this.#afterSpace = /\s$/.test(text);
    // Where the edit started. The DOM's selection has already moved, so a deletion's start is the
    // caret before it: `#selection`, which the last commit or `selectionchange` set. Backspace
    // then joins the step while each deletion starts where the last one left the caret. Typing
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

  /** While a list at the caret is open, no chip is selected: a `select` chip goes whole. */
  #deletion(chip: T): ComposerChipDeletion {
    const {chipDeletion} = this.options;
    const deletion = typeof chipDeletion === 'function' ? chipDeletion(chip) : chipDeletion;
    return deletion === 'select' && this.#keyHandler ? 'whole' : deletion;
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
      // A selected chip goes with either key, as a selection does: see `handleKeyDown`, which
      // takes the keys first unless the keyboard sends none (key 229).
      const backward = type.includes('Backward');
      const neighbour =
        this.#find(this.#armed?.id)?.at ?? (backward ? range.start - 1 : range.start);
      const chip = chipAt(this.#latest, neighbour);
      if (chip && event.cancelable) {
        event.preventDefault();
        this.#removeChip(chip, neighbour, event, backward);
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
    // The browser's target holds only zero-width spaces, as for Delete after a final chip: it would
    // delete a chip's caret stop and nothing visible. Extend from the caret as far as the browser's
    // deletion would reach (`Selection.modify`, with its word and line rules) and delete that, if
    // anything.
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

  /** A selected (armed) chip is removed whole, whatever its `chipDeletion`. */
  #removeChip(chip: T, offset: number, event: Event, backward: boolean): void {
    const deletion = this.#armed?.id === chip.id ? 'whole' : this.#deletion(chip);
    const range = {start: offset, end: offset + 1};
    if (deletion === 'select') {
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

  /** The chip with `id` in the value, and its offset. */
  #find(id: string | undefined): {readonly chip: T; readonly at: number} | undefined {
    const at = id === undefined ? undefined : offsetOfChip(this.#latest, id);
    const chip = at === undefined ? undefined : chipAt(this.#latest, at);
    return chip && at !== undefined ? {chip, at} : undefined;
  }

  /** The chip whose host `target` is in. */
  #chipOf(target: EventTarget | null): {readonly chip: T; readonly at: number} | undefined {
    const host = target instanceof Element ? target.closest<HTMLElement>('[data-chip-id]') : null;
    return host && this.#element?.contains(host) ? this.#find(host.dataset.chipId) : undefined;
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

  /** Shows the previous or next undo step without recording it. */
  #applyStep(reason: 'history-undo' | 'history-redo', event?: Event): void {
    const step = reason === 'history-undo' ? this.#history.undo() : this.#history.redo();
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

  /** The value of a copy from this editor. */
  #ownClip(data: DataTransfer | null): ComposerValue<T> | undefined {
    const clip = this.#clip;
    const pasted = new RegExp(`${CLIP}="([^"]+)"`).exec(data?.getData('text/html') ?? '')?.[1];
    return clip && pasted === clip.id ? clip.value : undefined;
  }

  #markSelected(range: ComposerTextRange): void {
    const ids = new Set(
      chipsOf(sliceValue(this.#latest, range.start, range.end)).map((chip) => chip.id),
    );
    if (this.#armed) ids.add(this.#armed.id);
    this.#setSelected(ids);
  }

  #setSelected(ids: ReadonlySet<string>): void {
    this.#view?.mark('data-selected', ids);
    const changed =
      ids.size !== this.#selected.size || [...ids].some((id) => !this.#selected.has(id));
    this.#selected = ids;
    if (changed) this.#emit();
  }

  isChipSelected = (id: string): boolean => this.#selected.has(id);

  textBeforeCaret(): string | null {
    const view = this.#focused ? this.#view : undefined;
    const range = view?.selection();
    if (!view || !range || range.start !== range.end) return null;
    return offsetText(sliceValue(this.#composing ? view.read() : this.#latest, 0, range.start));
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

  takesFiles = (event: DragEvent): boolean =>
    this.options.editable &&
    this.options.onAttach !== undefined &&
    this.#dragged === undefined &&
    (event.dataTransfer?.types.includes('Files') ?? false);

  /** Files go in at the caret the person placed, not under the pointer. */
  dropFiles = (event: DragEvent): boolean => {
    const files = [...(event.dataTransfer?.files ?? [])];
    if (!this.takesFiles(event) || !files.length) return false;
    this.#endComposition();
    this.#attach(files, this.#fileCaret(), {reason: 'drop', event});
    return true;
  };

  setKeyHandler(handler: ((event: KeyboardEvent) => boolean) | undefined): void {
    this.#keyHandler = handler;
    if (!handler || !this.#armed) return;
    this.#armed = undefined;
    this.#markSelected(this.#selection ?? caretAt(0));
  }

  handleKeyDown = (event: KeyboardEvent): void => {
    // Paste as text, on the key: browsers differ in what the paste event carries. The paste comes
    // before the key's keyup, which clears it. With Alt too, as Safari's Paste and Match Style
    // (⌥⇧⌘V), whose `key` is a symbol, so the key's place counts as well.
    this.#plainPaste =
      (isApple() ? event.metaKey : event.ctrlKey) &&
      event.shiftKey &&
      (event.key.toLowerCase() === 'v' || event.code === 'KeyV');
    if (event.defaultPrevented || this.#composingKey(event)) return;
    if (this.#keyHandler?.(event)) {
      event.preventDefault();
      return;
    }
    const mod = isApple() ? event.metaKey : event.ctrlKey;
    const key = event.key.toLowerCase();
    if (mod && !event.altKey && key === 'z') {
      event.preventDefault();
      if (this.options.editable) {
        this.#applyStep(event.shiftKey ? 'history-redo' : 'history-undo', event);
      }
      return;
    }
    if (!isApple() && event.ctrlKey && key === 'y') {
      event.preventDefault();
      if (this.options.editable) this.#applyStep('history-redo', event);
      return;
    }
    // While a list at the caret is open, the keys it doesn't take edit the text: no chip is
    // selected, and the arrows move past a chip in one press.
    const listOpen = this.#keyHandler !== undefined;
    // A selected chip goes with Backspace or Delete, as a selection does. On the key: WebKit fires
    // no `beforeinput` for Backspace at the start of the text.
    const armed = listOpen ? undefined : this.#find(this.#armed?.id);
    if (armed && (event.key === 'Backspace' || event.key === 'Delete') && !event.altKey) {
      event.preventDefault();
      if (this.options.editable)
        this.#removeChip(armed.chip, armed.at, event, event.key === 'Backspace');
      return;
    }
    if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && !mod && !event.altKey) {
      this.#arrowBesideChip(event);
      return;
    }
    if (mod && (key === 'b' || key === 'i' || key === 'u')) {
      event.preventDefault();
      return;
    }
    if (event.key === 'Enter') {
      const {onSubmit, submitShortcut} = this.options;
      // Alt is allowed with either shortcut; `onSubmit` reads `event.altKey`.
      const submits =
        !event.shiftKey && (submitShortcut === 'enter' ? !event.ctrlKey && !event.metaKey : mod);
      if (!submits || !onSubmit) return;
      event.preventDefault();
      onSubmit(this.#latest, {event});
    }
  };

  /**
   * Safari sends the key that ends a composition after its end, as key 229. A keyboard that sends
   * Enter as 229 (`key` "Unidentified", on some Android keyboards) gets a new line.
   */
  #composingKey(event: KeyboardEvent): boolean {
    return event.isComposing || this.#composing || event.keyCode === 229;
  }

  recallKey(
    event: KeyboardEvent,
    messages: readonly ComposerValue<ComposerChip>[],
    from: ComposerRecallFrom,
  ): boolean {
    const edge = event.key === 'ArrowUp' ? 'up' : event.key === 'ArrowDown' ? 'down' : undefined;
    if (
      !edge ||
      event.defaultPrevented ||
      event.shiftKey ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      this.#composingKey(event) ||
      !this.options.editable ||
      this.#keyHandler
    )
      return false;
    const recall = this.recalling() ? this.#recall : undefined;
    if (!recall && (edge === 'down' || (from === 'empty' && valueLength(this.#latest) > 0)))
      return false;
    if (!this.actions.atEdge(edge)) return false;
    const at = recall ? this.#indexOf(recall, messages) : -1;
    let index = at === -1 ? messages.length : at;
    let message: ComposerValue<ComposerChip> | undefined;
    do {
      index += edge === 'up' ? -1 : 1;
      message = messages[index];
    } while (message && this.#shows(message));
    if (message) this.#showRecalled(message, index, recall?.draft ?? this.#latest, event);
    else if (edge === 'down' && recall) this.#restoreDraft(recall, event);
    else return false;
    return true;
  }

  recalling(): boolean {
    return this.#recall !== undefined && sameValue(this.#recall.shown, this.#latest);
  }

  /**
   * Where the message shown is in `messages`, which may have changed since: at the same index, by
   * identity elsewhere, as in a list trimmed from the front, or, in one built anew on every render,
   * by content nearest the same index, earlier first, so a message sent twice stays apart from its
   * copy. `-1` when it's gone, and the recall starts again from the newest.
   */
  #indexOf(recall: Recall<T>, messages: readonly ComposerValue<ComposerChip>[]): number {
    if (messages[recall.index] === recall.message) return recall.index;
    const at = messages.lastIndexOf(recall.message);
    if (at !== -1) return at;
    for (let distance = 0; distance <= recall.index + messages.length; distance += 1) {
      for (const index of [recall.index - distance, recall.index + distance]) {
        const message = messages[index];
        if (message && this.#shows(message)) return index;
      }
    }
    return -1;
  }

  /** Chips by id: a message with chips is the text also when its chips are copies. */
  #shows(message: ComposerValue<ComposerChip>): boolean {
    // SAFETY: as with `ComposerValue<T>` in the hooks, the caller names this editor's chip type.
    return sameContent(this.#normalizeGiven(message as ComposerValue<T>), this.#latest);
  }

  /** The first recall is an undo step of its own; the next ones replace it. */
  #showRecalled(
    message: ComposerValue<ComposerChip>,
    index: number,
    draft: ComposerValue<T>,
    event: KeyboardEvent,
  ): void {
    // SAFETY: as in `#shows`.
    const given = message as ComposerValue<T>;
    const shown = this.#commit(given, caretAt(valueLength(given)), 'list-navigation', event, {
      group: 'recall',
    });
    if (shown) this.#recall = {message, index, shown: this.#latest, draft};
  }

  /**
   * Shows the draft again. While the recall's undo step is the current one, it goes, and the draft
   * is the step before it again; otherwise, after an undo and a redo, the draft is a new step.
   */
  #restoreDraft(recall: Recall<T>, event: KeyboardEvent): void {
    const onRecall = this.#history.current().value === recall.shown;
    const before = onRecall ? this.#history.previous() : undefined;
    const {draft} = recall;
    // A draft equal to the message shown needs no change, but the recall still ends.
    const back =
      sameValue(draft, this.#latest) ||
      this.#commit(draft, caretAt(valueLength(draft)), 'list-navigation', event, {
        record: !(before && sameValue(before.value, draft)),
      });
    if (!back) return;
    if (onRecall) this.#history.drop();
    this.#recall = undefined;
  }

  /**
   * Left or Right towards a chip beside the caret: the first press selects it for removal, as a
   * press on it does, and the second moves the caret past it; in a read-only prompt, or while a
   * list at the caret is open, the first moves past. With Shift, the selection's moving end goes
   * past the chip in one press. The editor moves the caret: the zero-width spaces around a host are
   * caret stops of their own to the browser, which would cost one more press.
   */
  #arrowBesideChip(event: KeyboardEvent): void {
    const view = this.#view;
    const range = view?.selection();
    const focus = view?.focusOffset();
    if (!view || !this.#element || !range || focus == null) return;
    if (!event.shiftKey && range.start !== range.end) return;
    const before = chipAt(this.#latest, focus - 1);
    const after = chipAt(this.#latest, focus);
    // Reading the direction recalculates styles, so only with a chip beside the caret.
    if (!before && !after) return;
    const forward =
      (event.key === 'ArrowRight') !== (getComputedStyle(this.#element).direction === 'rtl');
    const chip = forward ? after : before;
    if (!chip) return;
    event.preventDefault();
    const past = forward ? focus + 1 : focus - 1;
    if (event.shiftKey) {
      view.extendTo(past);
      return;
    }
    if (this.options.editable && !this.#keyHandler && this.#armed?.id !== chip.id) {
      this.#arm(chip, focus, forward ? 'Delete' : 'Backspace');
      return;
    }
    this.#armed = undefined;
    this.#selection = caretAt(past);
    view.select(this.#selection);
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
    insert: (
      content,
      {at = 'caret', startLine = false, reason = 'imperative-action', event, space = false} = {},
    ) => {
      if (!this.options.editable) return false;
      this.#endComposition();
      const length = valueLength(this.#latest);
      const range = at === 'end' ? caretAt(length) : at === 'caret' ? this.#caret() : at;
      const given = typeof content === 'string' || 'id' in content ? [content] : content;
      const before = offsetText(sliceValue(this.#latest, 0, range.start));
      const segments =
        startLine && before !== '' && !before.endsWith('\n') ? ['\n', ...given] : given;
      return this.#insert(
        space ? withSpaces(this.#latest, range, segments) : segments,
        range,
        event,
        reason,
      );
    },
    undo: () => this.#applyStep('history-undo'),
    redo: () => this.#applyStep('history-redo'),
    clearHistory: (historyKey = this.#historyKey) => {
      if (historyKey !== this.#historyKey) {
        this.#histories.delete(historyKey);
        return;
      }
      // You may clear the history before Root shows the value it starts from, such as when
      // sending, so the next value shown starts it.
      this.#history = new History<Step<T>>({value: this.#latest, selection: null});
      this.#histories.set(historyKey, this.#history);
      this.#edit = undefined;
      this.#cleared = true;
      this.#recall = undefined;
    },
    submit: (event) => this.options.onSubmit?.(this.#latest, {event}),
    getValue: () => this.#latest,
    attach: (files) => {
      if (files.length) this.#attach(files, this.#fileCaret(), {reason: 'api'});
    },
    atEdge: (edge) => {
      const view = this.#view;
      const range = view?.selection();
      if (!this.#focused || !view || !range || range.start !== range.end) return false;
      if (this.#armed || this.#composing) return false;
      // A line break between the caret and the edge settles it; within a line, the layout does.
      const text = offsetText(this.#latest);
      const caret = range.start;
      if (edge === 'up') {
        if (text.slice(0, caret).includes('\n')) return false;
        return caret === 0 || view.onSameLine(0, this.#charAtCaret(text, caret, 'up'));
      }
      if (text.includes('\n', caret)) return false;
      return (
        caret === text.length ||
        view.onSameLine(text.length - 1, this.#charAtCaret(text, caret, 'down'))
      );
    },
  };

  /**
   * A character on the caret's line. Where a line wraps, the caret before its first character
   * shows on either line, so each edge measures the character away from it: the one after the
   * caret for `up`, the one before for `down`. A caret at a wrap then takes one press more:
   * ArrowUp moves it to the line's start, ArrowDown to its end.
   */
  #charAtCaret(text: string, caret: number, edge: 'up' | 'down'): number {
    if (edge === 'up') return caret < text.length && text[caret] !== '\n' ? caret : caret - 1;
    return caret > 0 && text[caret - 1] !== '\n' ? caret - 1 : caret;
  }

  pick(files: File[], event: Event): void {
    this.#attach(files, this.#fileCaret(), {reason: 'picker', event});
  }

  /**
   * The last caret, also while blurred, clamped: a value shown since may be shorter. The end
   * before there was one.
   */
  #caret(): ComposerTextRange {
    return this.#clamp(this.#selection ?? caretAt(valueLength(this.#latest)));
  }

  /** Files never replace selected text: they go after it, at its logical end. */
  #fileCaret(): ComposerTextRange {
    return caretAt(this.#caret().end);
  }

  /** Commits pending IME text, before an edit that may land beside it. */
  #endComposition(): void {
    if (!this.#composing) return;
    this.#composing = false;
    this.#readBack(undefined);
  }

  /** `details.insert` refuses once the text changed: `at` is an offset into what `onAttach` saw. */
  #attach(files: File[], at: ComposerTextRange, source: AttachSource): void {
    const {onAttach} = this.options;
    if (!onAttach) return;
    const seen = this.#revision;
    const how = insertOptionsFor(source);
    onAttach(files, {
      ...source,
      at,
      insert: (content) => {
        this.#endComposition();
        return this.#revision === seen && this.actions.insert(content, {...how, at, space: true});
      },
    });
  }

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
        this.#applyStep(type === 'historyUndo' ? 'history-undo' : 'history-redo', event);
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

    // Cmd/Ctrl+Shift+V pastes text as text: neither a copy's chips nor `getPastedValue`'s.
    const onPaste = (event: ClipboardEvent) => {
      event.preventDefault();
      const plain = this.#plainPaste;
      this.#plainPaste = false;
      if (!this.options.editable) return;
      this.#endComposition();
      const range = view()?.selection();
      if (!range) return;
      const files = [...(event.clipboardData?.files ?? [])];
      if (files.length && this.options.onAttach) {
        this.#attach(files, range, {reason: 'paste', event});
        return;
      }
      const data = event.clipboardData;
      const text = plainText(data);
      const own = plain ? undefined : this.#ownClip(data);
      const made = own || plain || !text ? undefined : this.options.getPastedValue?.(text, {event});
      // Made from the text: the text as text is the step before, so Undo gives it.
      const prior =
        made && !sameValue(normalize(made), [text])
          ? {
              value: replaceRange(this.#latest, range, [text]),
              selection: caretAt(range.start + text.length),
            }
          : undefined;
      const content = withNewIds(own ?? made ?? [text], replaceRange(this.#latest, range, []));
      if (!content.some((segment) => segment !== '')) return;
      this.#insert(content, range, event, 'input-paste', prior);
    };

    let faint = 0;
    // A finger doesn't drag a chip: its long press stays the text's own selection. Any other
    // pointer, a mouse or a pen, or one whose type the engine leaves empty, makes the host
    // draggable while it is over it, so before the press, when WebKit decides whether it starts a
    // drag, and on through the press, whatever boundary events come, since Firefox decides only
    // once the pointer has moved, maybe off the chip.
    let draggableHost: HTMLElement | undefined;
    let held = false;
    const releaseHost = () => {
      if (draggableHost) draggableHost.draggable = false;
      draggableHost = undefined;
    };
    const holdHost = (event: PointerEvent) => {
      // Also when a mouse rests on the chip a finger presses: the finger's press takes none.
      if (event.pointerType === 'touch') {
        releaseHost();
        return;
      }
      const host =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>('[data-chip-id]')
          : null;
      if (host === draggableHost) return;
      releaseHost();
      if (!host || !element.contains(host)) return;
      host.draggable = true;
      draggableHost = host;
    };
    const onPointerOver = (event: PointerEvent) => {
      if (!held) holdHost(event);
    };
    const onPointerOut = (event: PointerEvent) => {
      const to = event.relatedTarget;
      if (held || (to instanceof Node && draggableHost?.contains(to))) return;
      releaseHost();
    };
    // The press may end anywhere; off the chip, it's no longer draggable. Chromium cancels the
    // press when a drag starts, and the drag's end releases the chip.
    const onPointerEnd = (event: PointerEvent) => {
      held = false;
      if (
        event.type === 'pointerup' &&
        !(event.target instanceof Node && draggableHost?.contains(event.target))
      )
        releaseHost();
    };

    // A chip drags by itself unless it's in the selection, which then drags as a whole. Its chips
    // stay faint where they were until the drop. No dragging by a finger: a long press is the
    // text's own selection, and cut and paste move a chip.
    const onDragStart = (event: DragEvent) => {
      this.#pressedChip = undefined;
      const current = view();
      if (!current) return;
      if (this.#pressedBy === 'touch') {
        event.preventDefault();
        return;
      }
      const selection = current.selection();
      const pressed = this.#chipOf(event.target);
      const range =
        pressed && !(selection && selection.start <= pressed.at && pressed.at < selection.end)
          ? {start: pressed.at, end: pressed.at + 1}
          : selection;
      if (!range || range.start === range.end) return;
      this.#dragged = range;
      this.#writeClipboard(event.dataTransfer, range);
      // A read-only prompt keeps its chips: a drag out of it copies them.
      if (!this.options.editable) return;
      const ids = new Set(
        chipsOf(sliceValue(this.#latest, range.start, range.end)).map(({id}) => id),
      );
      // After the browser drew the drag image from the chip, which stays at full strength.
      faint = requestAnimationFrame(() => current.mark('data-dragging', ids));
    };

    const endDrag = () => {
      this.#dragged = undefined;
      cancelAnimationFrame(faint);
      view()?.mark('data-dragging', new Set());
      held = false;
      releaseHost();
    };

    // Text and a drag from this editor go in at the drop point; files are `Composer.Field`'s.
    // Captured, as Field's: a drop on a chip reaches the page's React handlers through Root's
    // portal before it bubbles here, and `preventDefault` tells them the prompt took it.
    const onDrop = (event: DragEvent) => {
      if (this.takesFiles(event)) return;
      event.preventDefault();
      const source = this.#dragged;
      // Also here: `dragend` doesn't reach the editor when the drop removed the node it started on.
      endDrag();
      const current = view();
      if (!this.options.editable || !current) return;
      this.#endComposition();
      let at = current.offsetAtPoint(event.clientX, event.clientY) ?? valueLength(this.#latest);
      let value = this.#latest;
      // A drag inside the editor moves the text, unless it's dropped onto itself or Ctrl or Alt
      // copies it.
      if (source && !(event.ctrlKey || event.altKey)) {
        if (at > source.start && at < source.end) return;
        value = replaceRange(value, source, []);
        if (at >= source.end) at -= source.end - source.start;
      }
      const content = withNewIds(
        source
          ? sliceValue(this.#latest, source.start, source.end)
          : (this.#ownClip(event.dataTransfer) ?? [plainText(event.dataTransfer)]),
        value,
      );
      const next = replaceRange(value, caretAt(at), content);
      this.#commit(next, caretAt(at + valueLength(content)), 'input-drop', event);
    };

    // A press on a chip of the focused editor selects it, with the caret collapsed after it: a
    // native range would make iOS draw a highlight with handles across the line. A finger's
    // selects it at once, and the keyboard stays up. Another pointer's may start a drag, so the
    // chip is selected at the click.
    const onPointerDown = (event: PointerEvent) => {
      this.#pressing = true;
      held = true;
      holdHost(event);
      this.#pressedBy = event.pointerType;
      this.#pressedChip = undefined;
      if (!this.#focused || !this.options.editable) return;
      const pressed = this.#chipOf(event.target);
      if (!pressed) return;
      if (event.pointerType !== 'touch') {
        this.#pressedChip = pressed.chip.id;
        return;
      }
      event.preventDefault();
      this.#arm(pressed.chip, pressed.at + 1, 'Backspace');
    };

    const onClick = (event: MouseEvent) => {
      const id = this.#pressedChip;
      this.#pressedChip = undefined;
      const pressed = this.#chipOf(event.target);
      if (id !== undefined && pressed?.chip.id === id)
        this.#arm(pressed.chip, pressed.at + 1, 'Backspace');
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
      this.#setSelected(new Set());
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
    element.addEventListener('drop', onDrop, true);
    stops.push(() => element.removeEventListener('drop', onDrop, true));
    on('beforeinput', onBeforeInput);
    on('input', onInput);
    on('copy', onCopy);
    on('cut', onCut);
    on('paste', onPaste);
    on('dragstart', onDragStart);
    on('dragend', endDrag);
    on('keyup', () => {
      this.#plainPaste = false;
    });
    on('pointerdown', onPointerDown);
    on('pointerover', onPointerOver);
    on('pointerout', onPointerOut);
    on('click', onClick);
    on('compositionstart', onCompositionStart);
    on('compositionend', onCompositionEnd);
    on('focus', onFocus);
    on('blur', onBlur);
    document.addEventListener('selectionchange', onSelectionChange);
    stops.push(() => document.removeEventListener('selectionchange', onSelectionChange));
    for (const type of ['pointerup', 'pointercancel'] as const) {
      document.addEventListener(type, onPointerEnd);
      stops.push(() => document.removeEventListener(type, onPointerEnd));
    }
    if (document.activeElement === element) onFocus();
    return () => {
      for (const stop of stops) stop();
    };
  }
}

function insertOptionsFor(source: AttachSource): ComposerInsertOptions {
  switch (source.reason) {
    case 'drop':
      return {reason: 'input-drop', event: source.event};
    case 'paste':
      return {reason: 'input-paste', event: source.event};
    case 'picker':
      return {event: source.event};
    case 'api':
      return {};
  }
}

/** Line breaks as the value has them. */
const plainText = (data: DataTransfer | null): string =>
  data?.getData('text/plain').replace(/\r\n?/g, '\n') ?? '';
