import {createContext, use, useRef, useSyncExternalStore, type RefObject} from 'react';

import type {ComposerActions, EditorBinding} from './editor/editor.ts';
import type {ComposerChip, ComposerValue} from './editor/model.ts';
import {createStore, type Store} from './store.ts';

/** Whether the prompt is empty, disabled or read-only, for the parts' `render` and `useStatus`. */
export interface ComposerState {
  /** Nothing is written: no text and no chips. */
  readonly empty: boolean;
  readonly disabled: boolean;
  readonly readOnly: boolean;
}

/**
 * Root's settings for its parts: what changes only when Root's props do, so typing doesn't render
 * the parts that read it again.
 */
export interface ComposerSettings {
  readonly disabled: boolean;
  readonly readOnly: boolean;
  readonly name: string | undefined;
  readonly required: boolean;
  readonly form: string | undefined;
}

/** The suggestions list, as the prompt's ARIA attributes name it. */
export interface PromptPopup {
  /** The list's id while it shows; the popup's while only the empty state does. */
  readonly controls: string | undefined;
  /** The highlighted option's id, set only once a person used the arrow keys. */
  readonly active: string | undefined;
}

/** `null` while no `Composer.Suggestions` is mounted. */
export type PromptPopupStore = Store<PromptPopup | null>;

const samePopup = (a: PromptPopup | null, b: PromptPopup | null): boolean =>
  a === b || (a !== null && b !== null && a.controls === b.controls && a.active === b.active);

export const createPromptPopupStore = (): PromptPopupStore =>
  createStore<PromptPopup | null>(null, samePopup);

/** Stays the same object for Root's lifetime; its functions read Root's latest props. */
export interface ComposerMeta {
  readonly editor: EditorBinding;
  readonly actions: ComposerActions<ComposerChip>;
  /** The prompt's hidden form value, whose form the prompt submits and resets with. */
  readonly formValue: RefObject<HTMLTextAreaElement | null>;
  /** Calls `onAttach` with the files picked in `Composer.Attach`. */
  readonly pick: (files: File[], event: Event) => void;
  /** Whether Root's `onSubmit` takes a submit event of the Panel's form. */
  readonly takesSubmit: () => boolean;
  /** Sets the value back to `defaultValue`, for the form's reset. */
  readonly reset: (event: Event) => void;
  /**
   * A ref callback for Submit and Stop: when the one with the focus goes, the one that comes next
   * in this composer takes the focus up.
   */
  readonly handOff: (element: HTMLElement | null) => (() => void) | undefined;
  readonly popup: PromptPopupStore;
  /** Makes `owner` this Root's one `Composer.Suggestions`, or throws; returns the release. */
  readonly claimSuggestions: (owner: symbol) => () => void;
}

export const ComposerMetaContext = /* @__PURE__ */ createContext<ComposerMeta | null>(null);
export const ComposerStateContext = /* @__PURE__ */ createContext<ComposerState | null>(null);
export const ComposerSettingsContext = /* @__PURE__ */ createContext<ComposerSettings | null>(null);
/** The value as `toText` gives it, which a form submits. Changes with every edit. */
export const ComposerTextContext = /* @__PURE__ */ createContext<string | null>(null);

function required<Value>(value: Value | null, part: string): Value {
  if (value === null) throw new Error(`${part} must be inside Composer.Root.`);
  return value;
}

export const useComposerMeta = (part: string): ComposerMeta =>
  required(use(ComposerMetaContext), part);

export const useComposerState = (part: string): ComposerState =>
  required(use(ComposerStateContext), part);

export const useComposerSettings = (part: string): ComposerSettings =>
  required(use(ComposerSettingsContext), part);

export const useComposerText = (part: string): string => required(use(ComposerTextContext), part);

/**
 * The composer's actions, such as `insert` and `focus`. The same object for the composer's
 * lifetime, so reading it never renders again. Throws outside `Composer.Root`.
 */
export function useActions<T extends ComposerChip = ComposerChip>(): ComposerActions<T> {
  // SAFETY: a context can't carry Root's chip type. The caller names the type Root has, as with
  // `ComposerValue<T>`.
  return useComposerMeta('Composer.useActions').actions as ComposerActions<T>;
}

/**
 * Whether the prompt is empty, disabled or read-only. Renders again only when one of these
 * changes. Throws outside `Composer.Root`.
 */
export function useStatus(): ComposerState {
  return useComposerState('Composer.useStatus');
}

/**
 * What `selector` picks from the value, rendering again only when that changes by `isEqual`
 * (`Object.is` by default); an equal result keeps the previous reference. `selector` runs on every
 * edit: keep it cheap. Type `selector`'s parameter to name your chip type; with type arguments,
 * name both, as `useValue<MyChip, boolean>`. Throws outside `Composer.Root`.
 */
export function useValue<T extends ComposerChip, Selected>(
  selector: (value: ComposerValue<T>) => Selected,
  isEqual: (a: Selected, b: Selected) => boolean = Object.is,
): Selected {
  const {editor} = useComposerMeta('Composer.useValue');
  const last = useRef<
    | {
        readonly value: ComposerValue<ComposerChip>;
        readonly selector: typeof selector;
        readonly selected: Selected;
      }
    | undefined
  >(undefined);
  // React reads the snapshot several times per value; the selector runs once per value or
  // selector.
  const getSnapshot = (): Selected => {
    const value = editor.getValue();
    const previous = last.current;
    if (previous?.value === value && previous.selector === selector) return previous.selected;
    // SAFETY: as in `useActions`, the caller names Root's chip type.
    const selected = selector(value as ComposerValue<T>);
    const kept = previous && isEqual(previous.selected, selected) ? previous.selected : selected;
    last.current = {value, selector, selected: kept};
    return kept;
  };
  return useSyncExternalStore(editor.subscribeValue, getSnapshot, getSnapshot);
}
