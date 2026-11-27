import {
  memo,
  use,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from 'react';
import {createPortal} from 'react-dom';

import {ChipHostContext, type ChipHostContextValue} from '../chip/chip-host-context.ts';
import * as Chip from '../chip/index.ts';
import {useFieldRootContext} from '../utils/base-ui-internals.ts';
import {DisabledContext} from '../utils/disabled-context.ts';
import {
  ComposerMetaContext,
  ComposerSettingsContext,
  ComposerStateContext,
  ComposerTextContext,
  createPromptPopupStore,
  type ComposerMeta,
  type ComposerSettings,
  type ComposerState,
} from './context.ts';
import {
  Editor,
  type ComposerActions,
  type ComposerAttachDetails,
  type ComposerChangeDetails,
  type ComposerChipDeletion,
  type ComposerPasteDetails,
  type ComposerSubmitDetails,
  type ComposerSubmitShortcut,
  type EditorOptions,
} from './editor/editor.ts';
import {valueLength, type ComposerChip, type ComposerValue} from './editor/model.ts';

const NO_VALUE: ComposerValue<never> = [];
/** How soon (ms) after Submit or Stop let go of the focus the other takes it up. */
const HAND_OFF_MS = 500;
const noDescription = (): string => '';

export interface ComposerRootProps<T extends ComposerChip = ComposerChip> {
  /** The value, for a controlled composer: text and chips in order. */
  readonly value?: ComposerValue<T> | undefined;
  /** The value at first, uncontrolled, and after the form it is in resets. */
  readonly defaultValue?: ComposerValue<T> | undefined;
  /** Called on every edit; `details.cancel()` keeps the previous value. */
  readonly onValueChange?:
    | ((value: ComposerValue<T>, details: ComposerChangeDetails<T>) => void)
    | undefined;
  /** The value as text: what is copied, what a form submits, and what a `revert` chip becomes. */
  readonly toText: (value: ComposerValue<T>) => string;
  /** Renders a chip's content, usually a soft, compact `Chip.Root`. */
  readonly renderChip?: ((chip: T) => ReactNode) | undefined;
  /** What Backspace and Delete do to a chip beside the caret, for all chips or per chip. */
  readonly chipDeletion?: ComposerChipDeletion | ((chip: T) => ComposerChipDeletion) | undefined;
  /** For screen readers, such as "file"; read when the prompt places or selects the chip. */
  readonly getChipDescription?: ((chip: T) => string) | undefined;
  /** Announced when chips are removed. Defaults to "Removed {label}". */
  readonly getChipRemovedMessage?: ((chip: T) => string) | undefined;
  /** Announced when a chip is selected: by an arrow, a press, or a first Backspace or Delete. */
  readonly getChipSelectedMessage?: ((chip: T, key: 'Backspace' | 'Delete') => string) | undefined;
  /** Names the draft shown, so each draft keeps its own undo history. */
  readonly historyKey?: string | undefined;
  /** Called by the submit shortcut, `Composer.Submit`, the Panel's form and `submit()`. */
  readonly onSubmit?:
    | ((value: ComposerValue<T>, details: ComposerSubmitDetails) => void)
    | undefined;
  /** The keys that submit: `enter` or `mod-enter`. */
  readonly submitShortcut?: ComposerSubmitShortcut | undefined;
  /** Files picked, pasted, dropped on the input group or passed to `attach()`, for `details.insert`. */
  readonly onAttach?: ((files: File[], details: ComposerAttachDetails<T>) => void) | undefined;
  /** The value pasted text goes in as, such as a chip for a long text. */
  readonly getPastedValue?:
    | ((text: string, details: ComposerPasteDetails) => ComposerValue<T>)
    | undefined;
  /** Disables the prompt and the composer's buttons. */
  readonly disabled?: boolean | undefined;
  /** Keeps the text focusable and copyable, but not editable. */
  readonly readOnly?: boolean | undefined;
  /** The name the form submits the text under. A `Field.Root`'s `name` takes precedence. */
  readonly name?: string | undefined;
  /** Whether the form requires text before it submits. */
  readonly required?: boolean | undefined;
  /** The `id` of the form the prompt belongs to, when it isn't inside it. */
  readonly form?: string | undefined;
  /** Receives the composer's actions, the object `Composer.useActions()` returns. */
  readonly actionsRef?: RefObject<ComposerActions<T> | null> | undefined;
  readonly children?: ReactNode;
}

/**
 * Holds the prompt's value, its undo history and its settings for the parts inside it. Renders no
 * element: the parts and the hooks work anywhere inside it, also outside `Composer.Panel` and in
 * portals.
 */
export function ComposerRoot<T extends ComposerChip = ComposerChip>({
  value: valueProp,
  defaultValue = NO_VALUE,
  onValueChange,
  toText,
  renderChip,
  chipDeletion = 'whole',
  getChipDescription = noDescription,
  getChipRemovedMessage,
  getChipSelectedMessage,
  historyKey = '',
  onSubmit,
  submitShortcut = 'enter',
  onAttach,
  getPastedValue,
  disabled: disabledProp = false,
  readOnly = false,
  name,
  required = false,
  form,
  actionsRef,
  children,
}: ComposerRootProps<T>) {
  const field = useFieldRootContext();
  const disabled = use(DisabledContext) || Boolean(field.disabled) || disabledProp;
  const controlled = valueProp !== undefined;
  const [own, setOwn] = useState(defaultValue);
  const value = valueProp ?? own;
  // The editor shows the controlling component's value after every render, so every edit must
  // render, also one that component doesn't take: only then does its value replace it.
  const [, setEdits] = useState(0);

  const options: EditorOptions<T> = {
    onChange: (next, details) => {
      onValueChange?.(next, details);
      if (!details.isCanceled && !controlled) setOwn(next);
      setEdits((count) => count + 1);
    },
    toText,
    chipDeletion,
    getChipDescription,
    onSubmit,
    submitShortcut,
    editable: !disabled && !readOnly,
    onAttach,
    getPastedValue,
    getChipRemovedMessage,
    getChipSelectedMessage,
  };
  const latest = useRef({options, defaultValue});
  const [{editor, meta}] = useState(() => {
    let handedOffAt = Number.NEGATIVE_INFINITY;
    let suggestions: symbol | null = null;
    const created = new Editor(options, value, historyKey);
    const context: ComposerMeta = {
      editor: created,
      actions: created.actions,
      formValue: {current: null},
      pick: (files, event) => created.pick(files, event),
      takesSubmit: () => latest.current.options.onSubmit !== undefined,
      reset: (event) => created.reset(latest.current.defaultValue, event),
      handOff: (element) => {
        if (!element) return undefined;
        if (performance.now() - handedOffAt < HAND_OFF_MS) {
          handedOffAt = Number.NEGATIVE_INFINITY;
          element.focus();
        }
        return () => {
          if (element.ownerDocument.activeElement === element) handedOffAt = performance.now();
        };
      },
      popup: createPromptPopupStore(),
      claimSuggestions: (owner) => {
        if (suggestions !== null && suggestions !== owner)
          throw new Error(
            'A Composer.Root takes one Composer.Suggestions. For several triggers, use one Composer.useSuggestionMatch(triggers) with all your triggers, such as @ and /, and branch on match.character.',
          );
        suggestions = owner;
        return () => {
          if (suggestions === owner) suggestions = null;
        };
      },
    };
    return {editor: created, meta: context};
  });
  // Events read the props of the last render; the editor shows the value of every render.
  useLayoutEffect(() => {
    latest.current = {options, defaultValue};
    const {onSubmit: submit} = options;
    const owner = () => meta.formValue.current?.form;
    editor.setOptions({
      ...options,
      // Without `onSubmit`, the shortcut and `submit()` submit the form the prompt belongs to,
      // found when submitting: the prompt may mount later, or its `form` change. Outside a form
      // there is nothing to submit, and the shortcut adds a line.
      get onSubmit() {
        return submit ?? (owner() ? () => owner()?.requestSubmit() : undefined);
      },
    });
    editor.show(value, historyKey);
  });
  useImperativeHandle(actionsRef, () => editor.actions, [editor]);

  const empty = valueLength(value) === 0;
  const state = useMemo<ComposerState>(
    () => ({empty, disabled, readOnly}),
    [empty, disabled, readOnly],
  );
  const settings = useMemo<ComposerSettings>(
    () => ({disabled, readOnly, name, required, form}),
    [disabled, readOnly, name, required, form],
  );
  const text = toText(value);
  const hosts = useSyncExternalStore(editor.subscribeHosts, editor.hosts, editor.hosts);

  return (
    <ComposerMetaContext value={meta}>
      <ComposerStateContext value={state}>
        <ComposerSettingsContext value={settings}>
          <ComposerTextContext value={text}>
            {children}
            {hosts.map(({chip, content}) =>
              createPortal(
                <ChipHost chip={chip} renderChip={renderChip} editor={editor} />,
                content,
                chip.id,
              ),
            )}
          </ComposerTextContext>
        </ComposerSettingsContext>
      </ComposerStateContext>
    </ComposerMetaContext>
  );
}

interface ChipHostProps<T extends ComposerChip> {
  readonly chip: T;
  readonly renderChip: ((chip: T) => ReactNode) | undefined;
  readonly editor: Editor<T>;
}

/**
 * One chip's content in its host in the prompt. Memoized, so an edit elsewhere in the text doesn't
 * render the chips again.
 */
function ChipHostView<T extends ComposerChip>({chip, renderChip, editor}: ChipHostProps<T>) {
  const selected = useSyncExternalStore(
    editor.subscribe,
    () => editor.isChipSelected(chip.id),
    () => false,
  );
  const host = useMemo<ChipHostContextValue>(() => ({selected}), [selected]);
  return (
    <ChipHostContext value={host}>
      {renderChip ? (
        renderChip(chip)
      ) : (
        <Chip.Root variant="soft" density="compact">
          <Chip.Label>{chip.label}</Chip.Label>
        </Chip.Root>
      )}
    </ChipHostContext>
  );
}

// SAFETY: `memo` drops a component's type parameters; the props are `ChipHostView`'s.
const ChipHost = memo(ChipHostView) as typeof ChipHostView;
