import {mergeProps} from '@base-ui/react/merge-props';
import type {BaseUIChangeEventDetails} from '@base-ui/react/types';
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
import type {
  PopoverPopupProps,
  PopoverPortalProps,
  PopoverPositionerProps,
} from '../popover/popover.tsx';
import {createChangeEventDetails} from '../utils/change-event-details.ts';
import {mergeClassName} from '../utils/class-names.ts';
import {useMergedRef} from '../utils/refs.ts';
import {useComposerMeta, useComposerStatus} from './context.ts';
import {
  findMatch,
  type ComposerSuggestionMatch,
  type ComposerSuggestionTrigger,
} from './editor/match.ts';
import {offsetText} from './editor/model.ts';

import styles from './suggestions.module.css';

/** The items you found, and the match they answer. */
export type ComposerSuggestionResults<I> = {
  /** The match you searched for, so results for an earlier query show as stale. */
  readonly match: ComposerSuggestionMatch;
  /** In the order they show; `Composer.SuggestionItem`'s `index` points into it. */
  readonly items: readonly I[];
};

export interface ComposerSuggestionPickDetails {
  /** The key press, pointer release or click that picked the item. */
  readonly event: MouseEvent | KeyboardEvent;
}

export interface ComposerSuggestionStatusState {
  /** How many suggestions a person can pick; `0` when nothing matches. */
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
/** How long, in milliseconds, after a release that picked, the click that follows may come. */
const CLICK_AFTER_RELEASE = 500;

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
  /**
   * What `Composer.SuggestionStatus` says once typing pauses; `null` for nothing. `opening` counts
   * the times the list opened.
   */
  readonly status:
    | (ComposerSuggestionStatusState & {readonly key: string; readonly opening: number})
    | null;
  readonly activeIndex: number;
  readonly listId: string;
  readonly popupId: string;
  readonly optionId: (index: number) => string;
  readonly pick: (index: number, event: ComposerSuggestionPickDetails['event']) => boolean;
  readonly highlight: (index: number, event: MouseEvent) => void;
  readonly registerEmpty: () => () => void;
  readonly registerDisabled: (index: number) => () => void;
  /** A ref callback for the positioner, which follows its `data-anchor-hidden`. */
  readonly watchAnchor: (element: HTMLElement | null) => (() => void) | undefined;
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
  const last = useRef<
    | {
        readonly before: string | null;
        readonly triggers: readonly ComposerSuggestionTrigger[];
        readonly match: ComposerSuggestionMatch | null;
      }
    | undefined
  >(undefined);
  // The editor emits on every edit and caret move; the caller renders only when the match changes.
  const getSnapshot = (): ComposerSuggestionMatch | null => {
    const before = editor.textBeforeCaret();
    const previous = last.current;
    if (previous?.before === before && previous.triggers === triggers) return previous.match;
    const found = before === null ? null : findMatch(before, triggers);
    const match = previous && sameMatch(previous.match, found) ? previous.match : found;
    last.current = {before, triggers, match};
    return match;
  };
  return useSyncExternalStore(editor.subscribe, getSnapshot, () => null);
}

const sameMatch = (a: ComposerSuggestionMatch | null, b: ComposerSuggestionMatch | null) =>
  a === b ||
  (a !== null &&
    b !== null &&
    a.character === b.character &&
    a.query === b.query &&
    a.range.start === b.range.start &&
    a.range.end === b.range.end);

/** Base UI's reason names: `input-change` covers typing, caret moves and results arriving. */
export type ComposerSuggestionsChangeReason =
  | 'input-change'
  | 'item-press'
  | 'escape-key'
  | 'outside-press'
  | 'focus-out';

/** `cancel()` keeps the list open after `escape-key` or `outside-press`. */
export type ComposerSuggestionsChangeDetails =
  BaseUIChangeEventDetails<ComposerSuggestionsChangeReason>;

/** `none` with index `-1` when the highlight a person moved clears, such as on closing. */
export type ComposerSuggestionHighlightDetails =
  | {readonly reason: 'keyboard'; readonly event: KeyboardEvent; readonly index: number}
  | {readonly reason: 'pointer'; readonly event: MouseEvent; readonly index: number}
  | {readonly reason: 'none'; readonly event: undefined; readonly index: -1};

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
  /** Called when the list opens or closes, such as to cancel a request when it closes. */
  readonly onOpenChange?:
    | ((open: boolean, details: ComposerSuggestionsChangeDetails) => void)
    | undefined;
  /** Called when a person moves the highlight by key or pointer; with `undefined` when it clears. */
  readonly onItemHighlighted?:
    | ((item: I | undefined, details: ComposerSuggestionHighlightDetails) => void)
    | undefined;
  readonly children?: ReactNode;
}

/**
 * Suggestions at the trigger being typed, such as `@` for files or `/` for commands. Renders no
 * element. It opens when `results` answer the trigger at `match`, and results for an earlier query
 * at that trigger stay until new ones arrive. The focus stays in the prompt: the arrow keys move
 * through the list, Enter or Tab picks, and Escape closes it and calls `preventDefault()`, so check
 * `event.defaultPrevented` in your own Escape handlers. While the list shows, Enter never submits.
 * After Escape, that trigger stays closed until a new one is typed. With no items, it opens only to
 * show a `Composer.SuggestionEmpty`. It doesn't open while the prompt is disabled or read-only. Use
 * one per `Composer.Root`.
 */
export function ComposerSuggestions<I>({
  match,
  results,
  onItemPick,
  onOpenChange,
  onItemHighlighted,
  children,
}: ComposerSuggestionsProps<I>) {
  const {editor, popup} = useComposerMeta('Composer.Suggestions');
  const {disabled, readOnly} = useComposerStatus('Composer.Suggestions');

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
    !disabled &&
    !readOnly &&
    !held &&
    !(dismissed !== null && samePlace(dismissed, match));

  const [empties, setEmpties] = useState(0);
  const registerEmpty = useCallback(() => {
    setEmpties((count) => count + 1);
    return () => setEmpties((count) => count - 1);
  }, []);
  // While results load, the empty state stays up rather than flickering away.
  const visible = open && (items.length > 0 || empties > 0);
  // With the trigger scrolled out of view the popup is hidden, so it takes no keys and the prompt
  // controls nothing.
  const [anchorHidden, setAnchorHidden] = useState(false);
  const watchAnchor = useCallback((element: HTMLElement | null) => {
    if (!element) return undefined;
    const update = () => setAnchorHidden(element.hasAttribute('data-anchor-hidden'));
    update();
    const observer = new MutationObserver(update);
    observer.observe(element, {attributes: true, attributeFilter: ['data-anchor-hidden']});
    return () => {
      observer.disconnect();
      setAnchorHidden(false);
    };
  }, []);
  const seen = visible && !anchorHidden;

  const [disabledItems, setDisabledItems] = useState<ReadonlySet<number>>(() => new Set());
  const registerDisabled = useCallback((index: number) => {
    setDisabledItems((current) => new Set(current).add(index));
    return () =>
      setDisabledItems((current) => {
        const next = new Set(current);
        next.delete(index);
        return next;
      });
  }, []);
  const pickable = (index: number) =>
    index >= 0 && index < items.length && !disabledItems.has(index);
  const pickableCount = items.filter((_, index) => pickable(index)).length;

  // Each opening is new to the status, and a highlight doesn't outlive it, such as across an undo.
  const [opened, setOpened] = useState({open: false, count: 0});
  if (opened.open !== open) setOpened({open, count: opened.count + (open ? 1 : 0)});

  // A highlight a person moved holds while the query, and the query its results answer, stay.
  const answered = shown?.match.query;
  const [highlighted, setHighlighted] = useState<{
    readonly typed: string | null;
    readonly answered: string | undefined;
    readonly index: number;
    readonly byKeyboard: boolean;
  }>();
  if (!open && highlighted) setHighlighted(undefined);
  const current =
    highlighted?.typed === typed && highlighted.answered === answered && pickable(highlighted.index)
      ? highlighted
      : undefined;
  const activeIndex = current?.index ?? items.findIndex((_, index) => pickable(index));

  const listId = useId();
  const popupId = useId();
  const optionId = (index: number) => `${listId}-${index}`;

  // Why the list closes next, when it's something the list did: the pick's change comes in a later
  // render. Cleared after that render, so a pick that leaves the list open doesn't name a later
  // closing.
  const cause = useRef<{readonly reason: 'item-press'; readonly event: Event} | undefined>(
    undefined,
  );
  // Escape and outside presses report their closing as they happen, so it can be cancelled.
  const reported = useRef(false);

  const pick = (index: number, event: ComposerSuggestionPickDetails['event']): boolean => {
    const item = items[index];
    if (!match || item === undefined || !pickable(index) || stale) return false;
    cause.current = {reason: 'item-press', event};
    setTimeout(() => {
      cause.current = undefined;
    });
    onItemPick(item, match, {event});
    return true;
  };

  const dismiss = (
    reason: 'escape-key' | 'outside-press',
    event: KeyboardEvent | MouseEvent | TouchEvent,
  ): void => {
    if (!match) return;
    const details = createChangeEventDetails(reason, event);
    onOpenChange?.(false, details);
    if (details.isCanceled) return;
    reported.current = true;
    setDismissed({character: match.character, start: match.range.start});
  };

  const wasOpen = useRef(false);
  const reportOpenChange = useEffectEvent((next: boolean) => {
    const focused = editor.element()?.ownerDocument.activeElement === editor.element();
    const reason = cause.current?.reason ?? (next || focused ? 'input-change' : 'focus-out');
    onOpenChange?.(next, createChangeEventDetails(reason, cause.current?.event));
  });
  useLayoutEffect(() => {
    if (wasOpen.current === open) return;
    wasOpen.current = open;
    if (reported.current) reported.current = false;
    else reportOpenChange(open);
  }, [open]);

  const highlightedItem = current === undefined ? undefined : items[current.index];
  const reportCleared = useEffectEvent(() =>
    onItemHighlighted?.(undefined, {reason: 'none', event: undefined, index: -1}),
  );
  const hadHighlight = useRef(false);
  useLayoutEffect(() => {
    const has = highlightedItem !== undefined;
    if (hadHighlight.current && !has) reportCleared();
    hadHighlight.current = has;
  }, [highlightedItem]);

  const [slowFor, setSlowFor] = useState<string | null>(null);
  useEffect(() => {
    if (!stale || typed === null) return undefined;
    const timer = setTimeout(() => setSlowFor(typed), LOADING_DELAY);
    return () => clearTimeout(timer);
  }, [stale, typed]);
  const loading = stale && slowFor === typed;

  // Enter or Tab on stale items picks the first item of the new results, if they arrive within
  // `LOADING_DELAY`. After that Tab goes through, so results that never arrive don't hold it.
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

  const step = (by: 1 | -1): number => {
    const length = items.length;
    for (let moved = 1; moved <= length; moved += 1) {
      const index = (((activeIndex + by * moved) % length) + length) % length;
      if (pickable(index)) return index;
    }
    return -1;
  };

  const handleKey = useEffectEvent((event: KeyboardEvent): boolean => {
    if (event.altKey || event.ctrlKey || event.metaKey || !match) return false;
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && !event.shiftKey) {
      const index = step(event.key === 'ArrowDown' ? 1 : -1);
      const item = items[index];
      if (item === undefined) return false;
      setHighlighted({typed, answered, index, byKeyboard: true});
      onItemHighlighted?.(item, {reason: 'keyboard', event, index});
      editor.element()?.ownerDocument.getElementById(optionId(index))?.scrollIntoView({
        block: 'nearest',
      });
      return true;
    }
    if ((event.key === 'Enter' || event.key === 'Tab') && !event.shiftKey) {
      // Enter belongs to the list while it shows: it never submits then.
      const enter = event.key === 'Enter';
      if (stale && typed !== null && items.length > 0) {
        const wait = waiting.current;
        if (wait?.typed === typed) return enter || performance.now() - wait.since <= LOADING_DELAY;
        waiting.current = {typed, since: performance.now(), event};
        return true;
      }
      return pick(activeIndex, event) || enter;
    }
    if (event.key === 'Escape') {
      dismiss('escape-key', event);
      return true;
    }
    return false;
  });

  useLayoutEffect(() => {
    if (!seen) return undefined;
    editor.setKeyHandler((event) => handleKey(event));
    return () => editor.setKeyHandler(undefined);
  }, [editor, seen]);

  const active = seen && current?.byKeyboard ? optionId(activeIndex) : undefined;
  useLayoutEffect(() => {
    openAt.current = visible ? match?.range.start : undefined;
    popup.set({controls: seen ? (items.length > 0 ? listId : popupId) : undefined, active});
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
      ? {
          key: `${opened.count}:${typed}:${loading}`,
          opening: opened.count,
          count: pickableCount,
          loading,
        }
      : null;

  const context: SuggestionsContextValue = {
    count: items.length,
    stale,
    loading,
    visible,
    status,
    activeIndex,
    listId,
    popupId,
    optionId,
    pick,
    highlight: (index, event) => {
      const item = items[index];
      if (item === undefined || !pickable(index)) return;
      setHighlighted({typed, answered, index, byKeyboard: current?.byKeyboard ?? false});
      onItemHighlighted?.(item, {reason: 'pointer', event, index});
    },
    registerEmpty,
    registerDisabled,
    watchAnchor,
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
          if (next || details.reason !== 'outside-press') return;
          if (target instanceof Node && editor.element()?.contains(target)) return;
          dismiss('outside-press', details.event);
        }}
      >
        {children}
      </Popover.Root>
    </SuggestionsContext>
  );
}

export interface ComposerSuggestionPortalProps extends PopoverPortalProps {}

/**
 * Renders `Composer.SuggestionPositioner` at the end of the page's body, or in `container`, such as
 * a `Modal.Popup` the composer is in. Takes Base UI's `Popover.Portal` props.
 */
export function ComposerSuggestionPortal(props: ComposerSuggestionPortalProps) {
  return <Popover.Portal {...props} />;
}

export interface ComposerSuggestionPositionerProps extends Omit<PopoverPositionerProps, 'anchor'> {}

/**
 * Places the popup at the trigger, above its line by default. Goes inside
 * `Composer.SuggestionPortal`. Takes Base UI's `Popover.Positioner` props, except `anchor`.
 */
export function ComposerSuggestionPositioner({
  ref,
  className,
  side = 'top',
  align = 'start',
  sideOffset = 4,
  collisionPadding = 8,
  ...props
}: ComposerSuggestionPositionerProps) {
  const {anchor, visible, watchAnchor} = useSuggestions('Composer.SuggestionPositioner');
  const positionerRef = useMergedRef(ref, watchAnchor);
  return (
    <Popover.Positioner
      {...props}
      ref={positionerRef}
      anchor={anchor}
      side={side}
      align={align}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      hidden={!visible}
      className={mergeClassName(styles.positioner, className)}
    />
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
  const {stale, loading, popupId} = useSuggestions('Composer.SuggestionPopup');
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
      id={popupId}
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

/**
 * The `listbox` of `Composer.SuggestionItem`s. Name it with `aria-label`. Not rendered while there
 * are no items.
 */
export function ComposerSuggestionList({ref, render, ...props}: ComposerSuggestionListProps) {
  const {listId, visible, count} = useSuggestions('Composer.SuggestionList');
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({id: listId, role: 'listbox', className: styles.list}, props),
  });
  // Hidden, it would still be found by `[role="listbox"]` queries; empty, it has no options.
  return visible && count > 0 ? element : null;
}

/**
 * Items a press started on. The release picks, since the press's start is cancelled to keep the
 * focus in the prompt; a press that scrolls the list is cancelled.
 */
const pressedItems = new WeakSet<Element>();

/**
 * The release that picked unmounts the popup, and the browser still sends the click that follows
 * to whatever is under it then; this takes that click.
 */
function swallowNextClick(item: Element): void {
  const document = item.ownerDocument;
  const stop = () => {
    clearTimeout(timer);
    document.removeEventListener('click', swallow, true);
    document.removeEventListener('pointerdown', disarm, true);
  };
  const swallow = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    stop();
  };
  // A new press elsewhere, such as a quick tap on Send, gets its own click.
  const disarm = (event: PointerEvent) => {
    if (!(event.target instanceof Node && item.contains(event.target))) stop();
  };
  const timer = setTimeout(stop, CLICK_AFTER_RELEASE);
  document.addEventListener('click', swallow, true);
  document.addEventListener('pointerdown', disarm, true);
}

export interface ComposerSuggestionItemState {
  /** The item Enter or Tab picks. */
  readonly highlighted: boolean;
  /** The item answers an earlier query and can't be picked. */
  readonly stale: boolean;
  /** The item has `disabled`: the arrow keys skip it and it can't be picked. */
  readonly disabled: boolean;
}

export interface ComposerSuggestionItemProps extends useRender.ComponentProps<
  'div',
  ComposerSuggestionItemState
> {
  /** The item's position in `results.items`. */
  readonly index: number;
  /** Shows the item, but the arrow keys skip it and it can't be picked. */
  readonly disabled?: boolean | undefined;
}

/**
 * One `option` of the results, by its `index`. Renders `data-highlighted`, `data-stale` and
 * `data-disabled`. A press keeps the focus and the caret in the prompt, and a phone's keyboard up;
 * the item is picked when the press ends on it, and a press that scrolls the list picks nothing.
 * Only a mouse highlights the item under it.
 */
export function ComposerSuggestionItem({
  ref,
  render,
  index,
  disabled = false,
  ...props
}: ComposerSuggestionItemProps) {
  const {activeIndex, stale, optionId, pick, highlight, registerDisabled} =
    useSuggestions('Composer.SuggestionItem');
  useLayoutEffect(
    () => (disabled ? registerDisabled(index) : undefined),
    [disabled, index, registerDisabled],
  );
  const highlighted = index === activeIndex;
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    state: {highlighted, stale, disabled},
    props: mergeProps<'div'>(
      {
        id: optionId(index),
        role: 'option',
        'aria-selected': highlighted,
        'aria-disabled': stale || disabled || undefined,
        className: styles.item,
        onPointerDown: (event) => {
          if (event.button !== 0) return;
          event.preventDefault();
          if (!disabled) pressedItems.add(event.currentTarget);
        },
        onPointerUp: (event) => {
          const item = event.currentTarget;
          if (!pressedItems.delete(item)) return;
          // A touch stays captured by the item it started on, so check where it ended.
          const under = item.ownerDocument.elementFromPoint(event.clientX, event.clientY);
          if (under && item.contains(under) && pick(index, event.nativeEvent))
            swallowNextClick(item);
        },
        onPointerCancel: (event) => {
          pressedItems.delete(event.currentTarget);
        },
        onPointerMove: (event) => {
          if (event.pointerType === 'mouse' && !highlighted) highlight(index, event.nativeEvent);
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
  const {count, registerEmpty} = useSuggestions('Composer.SuggestionEmpty');
  useLayoutEffect(registerEmpty, [registerEmpty]);
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({className: styles.empty}, props),
  });
  return count === 0 ? element : null;
}

export interface ComposerSuggestionStatusProps extends Omit<
  useRender.ComponentProps<'div'>,
  'children'
> {
  /** Replaces the default text, called with the count once typing pauses, or while loading. */
  readonly children?: ((state: ComposerSuggestionStatusState) => ReactNode) | undefined;
}

function defaultStatus(
  {count, loading}: ComposerSuggestionStatusState,
  instructions: boolean,
): string {
  if (loading) return 'Loading suggestions.';
  if (count === 0) return 'No suggestions.';
  const counted = `${count} ${count === 1 ? 'suggestion' : 'suggestions'}.`;
  return instructions ? `${counted} Arrow keys to choose, Enter to insert.` : counted;
}

/**
 * A polite live region that tells screen readers how many suggestions there are once typing
 * pauses, that nothing matches, or that results are loading. The default text says how to choose
 * once per opening, where there is a keyboard. Visually hidden; to show it, override its styles
 * with your own `className`. Always mounted: place it inside `Composer.Suggestions`, outside the
 * portal.
 */
export function ComposerSuggestionStatus({
  ref,
  render,
  children,
  ...props
}: ComposerSuggestionStatusProps) {
  const {status} = useSuggestions('Composer.SuggestionStatus');
  const [said, setSaid] = useState<{readonly key: string; readonly instructions: boolean}>();
  // The opening the keys were last explained for.
  const explained = useRef<number | undefined>(undefined);
  const key = status?.key;
  const opening = status?.opening;
  const counted = status !== null && !status.loading && status.count > 0;
  useEffect(() => {
    if (key === undefined) return undefined;
    const timer = setTimeout(() => {
      // Without a fine pointer, there's likely no keyboard to choose with.
      const instructions =
        counted && explained.current !== opening && matchMedia('(any-pointer: fine)').matches;
      if (instructions) explained.current = opening;
      setSaid({key, instructions});
    }, STATUS_PAUSE);
    return () => clearTimeout(timer);
  }, [key, opening, counted]);
  const state = status && said?.key === status.key ? status : null;
  const speak = (now: ComposerSuggestionStatusState, instructions: boolean) =>
    children
      ? children({count: now.count, loading: now.loading})
      : defaultStatus(now, instructions);
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>(
      {
        role: 'status',
        className: styles.status,
        'aria-live': 'polite',
        'aria-atomic': true,
        children: state && said ? speak(state, said.instructions) : null,
      },
      props,
    ),
  });
}
