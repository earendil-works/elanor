import {mergeProps} from '@base-ui/react/merge-props';
import {useRender} from '@base-ui/react/use-render';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import * as Popover from '../popover/index.ts';
import type {PopoverPopupProps, PopoverPositionerProps} from '../popover/popover.tsx';
import {mergeClassName} from '../utils/class-names.ts';
import {useComposerMeta} from './context.ts';
import {
  findMatch,
  type ComposerSuggestionMatch,
  type ComposerSuggestionTrigger,
} from './editor/match.ts';
import {offsetText} from './editor/model.ts';

import styles from './suggestions.module.css';

/** The items you found, and the match they answer. */
export type ComposerSuggestionResults<I> = {
  readonly match: ComposerSuggestionMatch;
  readonly items: readonly I[];
};

export interface ComposerSuggestionPickDetails {
  /** The key press, pointer release or click that picked the item. */
  readonly event: MouseEvent | KeyboardEvent | PointerEvent;
}

export interface ComposerSuggestionStatusState {
  /** How many suggestions there are; `0` when nothing matches. */
  readonly count: number;
  /** Results for an earlier query have shown for over a second while new ones load. */
  readonly loading: boolean;
}

/**
 * How long, in milliseconds, results for an earlier query may show before they count as loading,
 * and how long Enter or Tab on them waits for the results of the query typed now.
 */
const LOADING_DELAY = 1000;
/** How long, in milliseconds, typing must pause before `Composer.SuggestionStatus` speaks. */
const STATUS_PAUSE = 500;

type Place = {readonly character: string; readonly start: number};

const samePlace = (a: Place, b: ComposerSuggestionMatch): boolean =>
  a.character === b.character && a.start === b.range.start;

interface SuggestionsContextValue {
  readonly count: number;
  /** The items answer an earlier query: they show, but can't be picked. */
  readonly stale: boolean;
  readonly loading: boolean;
  /** Open, with items or a `Composer.SuggestionEmpty` to show. */
  readonly visible: boolean;
  /** What `Composer.SuggestionStatus` says once typing pauses; `null` for nothing. */
  readonly status: (ComposerSuggestionStatusState & {readonly key: string}) | null;
  readonly activeIndex: number;
  readonly listId: string;
  readonly optionId: (index: number) => string;
  readonly pick: (index: number, event: ComposerSuggestionPickDetails['event']) => void;
  readonly highlight: (index: number) => void;
  readonly registerEmpty: () => () => void;
  readonly anchor: PopoverPositionerProps['anchor'];
}

const SuggestionsContext = /* @__PURE__ */ createContext<SuggestionsContextValue | null>(null);

function useSuggestions(part: string): SuggestionsContextValue {
  const context = use(SuggestionsContext);
  if (!context) throw new Error(`${part} must be inside Composer.Suggestions.`);
  return context;
}

/**
 * The trigger being typed before the caret and the query after it, such as `@rea`, or `null`.
 * Find results for it and pass both to `Composer.Suggestions`. Keep `triggers` the same array
 * between renders, or memoize it. Throws outside `Composer.Root`.
 */
export function useSuggestionMatch(
  triggers: readonly ComposerSuggestionTrigger[],
): ComposerSuggestionMatch | null {
  const {editor} = useComposerMeta('Composer.useSuggestionMatch');
  const before = useSyncExternalStore(
    editor.subscribe,
    () => editor.textBeforeCaret(),
    () => null,
  );
  return useMemo(() => (before === null ? null : findMatch(before, triggers)), [before, triggers]);
}

export interface ComposerSuggestionsProps<I> {
  /** The trigger being typed, from `Composer.useSuggestionMatch`. */
  readonly match: ComposerSuggestionMatch | null;
  /** Your items and the match they answer; `undefined` until you have any. */
  readonly results: ComposerSuggestionResults<I> | undefined;
  /** Called when a person picks an item: replace `match.range` with it, such as with `insert`. */
  readonly onItemPick: (
    item: I,
    match: ComposerSuggestionMatch,
    details: ComposerSuggestionPickDetails,
  ) => void;
  readonly children?: ReactNode;
}

/**
 * Suggestions at the trigger being typed, such as `@` for files or `/` for commands. Renders no
 * element. It opens when `results` answer the trigger at `match`, and results for an earlier query
 * at that trigger stay until new ones arrive. The focus stays in the prompt: the arrow keys move
 * through the list, Enter or Tab picks, and Escape closes it and calls `preventDefault()`, so check
 * `event.defaultPrevented` in your own Escape handlers. After Escape, that trigger stays closed
 * until a new one is typed. With no items, it opens only to show a `Composer.SuggestionEmpty`.
 * Must be inside `Composer.Root`.
 */
export function ComposerSuggestions<I>({
  match,
  results,
  onItemPick,
  children,
}: ComposerSuggestionsProps<I>) {
  const {editor, popup} = useComposerMeta('Composer.Suggestions');

  const shown =
    match !== null &&
    results !== undefined &&
    results.match.character === match.character &&
    results.match.range.start === match.range.start
      ? results
      : undefined;
  const items = shown?.items ?? [];
  const stale = match !== null && shown !== undefined && shown.match.query !== match.query;
  const typed = match ? `${match.character}@${match.range.start}:${match.query}` : null;

  // Escape closes the trigger at its place until it's removed or another one is typed.
  const [dismissed, setDismissed] = useState<Place | null>(null);
  if (dismissed && match && !samePlace(dismissed, match)) setDismissed(null);
  useEffect(() => {
    if (!dismissed) return undefined;
    const {character, start} = dismissed;
    return editor.subscribeValue(() => {
      const text = offsetText(editor.getValue()).slice(start, start + character.length);
      if (text !== character) setDismissed(null);
    });
  }, [editor, dismissed]);

  // Android keyboards compose nearly every word, so a list open at the trigger stays open while
  // composing; one that wasn't open doesn't open over an input method's own candidates.
  const [composition, setComposition] = useState<{
    readonly start: number;
    readonly openAt: number | undefined;
  } | null>(null);
  const openAt = useRef<number | undefined>(undefined);
  useEffect(() => {
    const inEditor = (event: Event) =>
      event.target instanceof Node && editor.element()?.contains(event.target) === true;
    const start = (event: CompositionEvent) => {
      if (!inEditor(event)) return;
      setComposition({start: editor.textBeforeCaret()?.length ?? 0, openAt: openAt.current});
    };
    const end = (event: Event) => {
      if (inEditor(event)) setComposition(null);
    };
    document.addEventListener('compositionstart', start);
    document.addEventListener('compositionend', end);
    document.addEventListener('focusout', end);
    return () => {
      document.removeEventListener('compositionstart', start);
      document.removeEventListener('compositionend', end);
      document.removeEventListener('focusout', end);
    };
  }, [editor]);
  const held =
    match !== null &&
    composition !== null &&
    composition.start <= match.range.start &&
    composition.openAt !== match.range.start;

  const open =
    match !== null &&
    shown !== undefined &&
    !held &&
    !(dismissed !== null && samePlace(dismissed, match));

  const [empties, setEmpties] = useState(0);
  const registerEmpty = useCallback(() => {
    setEmpties((count) => count + 1);
    return () => setEmpties((count) => count - 1);
  }, []);
  const visible = open && (items.length > 0 || (!stale && empties > 0));

  // A highlight holds while the query and the query its results answer stay the same.
  const answered = shown?.match.query;
  const [highlighted, setHighlighted] = useState<{
    readonly typed: string | null;
    readonly answered: string | undefined;
    readonly index: number;
    readonly byKeyboard: boolean;
  }>();
  const current =
    highlighted?.typed === typed &&
    highlighted.answered === answered &&
    highlighted.index < items.length
      ? highlighted
      : undefined;
  const activeIndex = items.length === 0 ? -1 : (current?.index ?? 0);

  const listId = useId();
  const optionId = (index: number) => `${listId}-${index}`;

  const pick = (index: number, event: ComposerSuggestionPickDetails['event']): boolean => {
    const item = items[index];
    if (!match || item === undefined || stale) return false;
    onItemPick(item, match, {event});
    return true;
  };

  const [slowFor, setSlowFor] = useState<string | null>(null);
  useEffect(() => {
    if (!stale || typed === null) return undefined;
    const timer = setTimeout(() => setSlowFor(typed), LOADING_DELAY);
    return () => clearTimeout(timer);
  }, [stale, typed]);
  const loading = stale && slowFor === typed;

  // Enter or Tab on stale items picks the first item of the new results, if they arrive within
  // `LOADING_DELAY`. After that the key goes through, so results that never arrive don't hold it.
  const waiting = useRef<{
    readonly typed: string;
    readonly since: number;
    readonly event: KeyboardEvent;
  }>(undefined);
  const pickWaited = useEffectEvent((event: KeyboardEvent) => pick(activeIndex, event));
  useLayoutEffect(() => {
    const wait = waiting.current;
    if (!wait || (stale && wait.typed === typed)) return;
    waiting.current = undefined;
    if (wait.typed === typed && performance.now() - wait.since <= LOADING_DELAY)
      pickWaited(wait.event);
  }, [stale, typed]);

  const handleKey = useEffectEvent((event: KeyboardEvent): boolean => {
    if (event.altKey || event.ctrlKey || event.metaKey || !match) return false;
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && !event.shiftKey) {
      if (items.length === 0) return false;
      const by = event.key === 'ArrowDown' ? 1 : -1;
      const index = (activeIndex + by + items.length) % items.length;
      setHighlighted({typed, answered, index, byKeyboard: true});
      document.getElementById(optionId(index))?.scrollIntoView({block: 'nearest'});
      return true;
    }
    if ((event.key === 'Enter' || event.key === 'Tab') && !event.shiftKey) {
      if (stale && typed !== null && items.length > 0) {
        const wait = waiting.current;
        if (wait?.typed === typed) return performance.now() - wait.since <= LOADING_DELAY;
        waiting.current = {typed, since: performance.now(), event};
        return true;
      }
      return pick(activeIndex, event);
    }
    if (event.key === 'Escape') {
      setDismissed({character: match.character, start: match.range.start});
      return true;
    }
    return false;
  });

  useLayoutEffect(() => {
    if (!visible) return undefined;
    editor.setKeyHandler((event) => handleKey(event));
    return () => editor.setKeyHandler(undefined);
  }, [editor, visible]);

  const active = visible && current?.byKeyboard ? optionId(activeIndex) : undefined;
  useLayoutEffect(() => {
    openAt.current = visible ? match?.range.start : undefined;
    popup.set({list: visible ? listId : undefined, active});
  });
  useLayoutEffect(() => () => popup.set(null), [popup]);

  // At the trigger, following it as the prompt scrolls. Where the trigger can't be measured, the
  // last place it was.
  const start = match?.range.start;
  const anchor = useMemo(() => {
    if (start === undefined) return null;
    let last: DOMRect | undefined;
    return {
      getBoundingClientRect: () => {
        const rect = editor.caretRect(start);
        if (rect) last = new DOMRect(rect.x, rect.y, rect.width, rect.height);
        return last ?? editor.element()?.getBoundingClientRect() ?? new DOMRect();
      },
      get contextElement() {
        return editor.element() ?? undefined;
      },
    };
  }, [editor, start]);

  const status =
    open && typed !== null && (loading || !stale)
      ? {key: `${typed}:${loading}`, count: items.length, loading}
      : null;

  const context: SuggestionsContextValue = {
    count: items.length,
    stale,
    loading,
    visible,
    status,
    activeIndex,
    listId,
    optionId,
    pick,
    highlight: (index) =>
      setHighlighted({typed, answered, index, byKeyboard: current?.byKeyboard ?? false}),
    registerEmpty,
    anchor,
  };

  return (
    <SuggestionsContext value={context}>
      <Popover.Root
        open={open}
        onOpenChange={(next, details) => {
          // A press in the prompt moves the caret, and the match follows it. Escape is the key
          // handler's.
          const target = details.event.target;
          if (next || details.reason !== 'outside-press' || !match) return;
          if (target instanceof Node && editor.element()?.contains(target)) return;
          setDismissed({character: match.character, start: match.range.start});
        }}
      >
        {children}
      </Popover.Root>
    </SuggestionsContext>
  );
}

export interface ComposerSuggestionPositionerProps extends Omit<PopoverPositionerProps, 'anchor'> {}

/**
 * Places the list at the trigger, above its line by default, in a portal. Takes Base UI's
 * `Popover.Positioner` props, except `anchor`.
 */
export function ComposerSuggestionPositioner({
  className,
  side = 'top',
  align = 'start',
  sideOffset = 4,
  collisionPadding = 8,
  ...props
}: ComposerSuggestionPositionerProps) {
  const {anchor, visible} = useSuggestions('Composer.SuggestionPositioner');
  return (
    <Popover.Portal>
      <Popover.Positioner
        {...props}
        anchor={anchor}
        side={side}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        hidden={!visible}
        className={mergeClassName(styles.positioner, className)}
      />
    </Popover.Portal>
  );
}

export interface ComposerSuggestionPopupProps extends Omit<
  PopoverPopupProps,
  'initialFocus' | 'finalFocus'
> {}

/**
 * The list's surface, Elanor's popover popup. It never takes the focus, and a press on it keeps the
 * focus in the prompt. Renders `data-stale` while its items answer an earlier query, and
 * `data-loading` once that has lasted a second.
 */
export function ComposerSuggestionPopup({
  className,
  onPointerDown,
  onMouseDown,
  ...props
}: ComposerSuggestionPopupProps) {
  const {stale, loading} = useSuggestions('Composer.SuggestionPopup');
  return (
    <Popover.Popup
      {...props}
      onPointerDown={(event) => {
        event.preventDefault();
        onPointerDown?.(event);
      }}
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown?.(event);
      }}
      initialFocus={false}
      finalFocus={false}
      role="presentation"
      data-stale={stale ? '' : undefined}
      data-loading={loading ? '' : undefined}
      className={mergeClassName(styles.popup, className)}
    />
  );
}

export interface ComposerSuggestionListProps extends useRender.ComponentProps<'div'> {}

/** The `listbox` of `Composer.SuggestionItem`s. Name it with `aria-label`. */
export function ComposerSuggestionList({ref, render, ...props}: ComposerSuggestionListProps) {
  const {listId, visible} = useSuggestions('Composer.SuggestionList');
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({id: listId, role: 'listbox', className: styles.list}, props),
  });
  // Hidden, it would still be found by `[role="listbox"]` queries.
  return visible ? element : null;
}

/**
 * Items a press started on. A touch press that began with its default prevented, which keeps the
 * focus in the prompt, never ends in a click, so the release picks; a press that scrolls the list
 * is cancelled.
 */
const pressedItems = new WeakSet<Element>();

export interface ComposerSuggestionItemState {
  /** The item Enter or Tab picks. */
  readonly highlighted: boolean;
  /** The item answers an earlier query and can't be picked. */
  readonly stale: boolean;
}

export interface ComposerSuggestionItemProps extends useRender.ComponentProps<
  'div',
  ComposerSuggestionItemState
> {
  /** The item's position in `results.items`. */
  readonly index: number;
}

/**
 * One `option` of the results, by its `index`. Renders `data-highlighted` and `data-stale`. A press
 * keeps the focus and the caret in the prompt, and a phone's keyboard up; the item is picked when
 * the press ends on it, and a press that scrolls the list picks nothing. Only a mouse highlights
 * the item under it.
 */
export function ComposerSuggestionItem({
  ref,
  render,
  index,
  ...props
}: ComposerSuggestionItemProps) {
  const {activeIndex, stale, optionId, pick, highlight} = useSuggestions('Composer.SuggestionItem');
  const highlighted = index === activeIndex;
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    state: {highlighted, stale},
    props: mergeProps<'div'>(
      {
        id: optionId(index),
        role: 'option',
        'aria-selected': highlighted,
        'aria-disabled': stale || undefined,
        className: styles.item,
        onPointerDown: (event) => {
          if (event.button !== 0) return;
          event.preventDefault();
          pressedItems.add(event.currentTarget);
        },
        onPointerUp: (event) => {
          const item = event.currentTarget;
          if (!pressedItems.delete(item)) return;
          // A touch stays captured by the item it started on, so check where it ended.
          const under = document.elementFromPoint(event.clientX, event.clientY);
          if (under && item.contains(under)) pick(index, event.nativeEvent);
        },
        onPointerCancel: (event) => {
          pressedItems.delete(event.currentTarget);
        },
        onPointerMove: (event) => {
          if (event.pointerType === 'mouse' && !highlighted) highlight(index);
        },
        // A click without a press, such as from a screen reader.
        onClick: (event) => {
          if (event.detail === 0) pick(index, event.nativeEvent);
        },
      },
      props,
    ),
  });
}

export interface ComposerSuggestionEmptyProps extends useRender.ComponentProps<'div'> {}

/**
 * What the popup says when nothing matches, such as "No matching files"; nothing while there are
 * items. Without it, the popup stays closed when nothing matches.
 */
export function ComposerSuggestionEmpty({ref, render, ...props}: ComposerSuggestionEmptyProps) {
  const {count, stale, registerEmpty} = useSuggestions('Composer.SuggestionEmpty');
  useLayoutEffect(registerEmpty, [registerEmpty]);
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({className: styles.empty}, props),
  });
  return count === 0 && !stale ? element : null;
}

export interface ComposerSuggestionStatusProps extends Omit<
  useRender.ComponentProps<'div'>,
  'children'
> {
  /** Replaces the default text, called with the count once typing pauses, or while loading. */
  readonly children?: ((state: ComposerSuggestionStatusState) => ReactNode) | undefined;
}

const defaultStatus = ({count, loading}: ComposerSuggestionStatusState): string => {
  if (loading) return 'Loading suggestions.';
  if (count === 0) return 'No suggestions.';
  return `${count} ${count === 1 ? 'suggestion' : 'suggestions'}. Arrow keys to choose, Enter to insert.`;
};

/**
 * A polite live region that tells screen readers how many suggestions there are and how to choose
 * once typing pauses, that nothing matches, or that results are loading. Always mounted: place it
 * inside `Composer.Suggestions`, outside the positioner, and hide it visually if you like.
 */
export function ComposerSuggestionStatus({
  ref,
  render,
  children = defaultStatus,
  ...props
}: ComposerSuggestionStatusProps) {
  const {status} = useSuggestions('Composer.SuggestionStatus');
  const [said, setSaid] = useState<string | null>(null);
  const key = status?.key ?? null;
  useEffect(() => {
    if (key === null) return undefined;
    const timer = setTimeout(() => setSaid(key), STATUS_PAUSE);
    return () => clearTimeout(timer);
  }, [key]);
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>(
      {
        role: 'status',
        'aria-live': 'polite',
        'aria-atomic': true,
        children:
          status && said === status.key
            ? children({count: status.count, loading: status.loading})
            : null,
      },
      props,
    ),
  });
}
