import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

import {classes} from '../utils/class-names.ts';
import {createDrum, FACE} from './drum.ts';

import styles from './ticker.module.css';

/** Degrees between neighbouring items on the drum, and the drum's radius (px). */
const STEP = 25;
const RADIUS = FACE / (2 * Math.sin(((STEP / 2) * Math.PI) / 180));
/** Items further than this from the one facing the reader are out of sight and not rendered. */
const VISIBLE = 3.5;
/** Each item of distance from the reader takes this much opacity. */
const FADE = 0.55;

interface ItemContextValue {
  /** Items from the drum's position: negative above, positive below. */
  distance: number;
  /** Whether the item faces the reader. */
  current: boolean;
  /** Whether it is the newest item. */
  newest: boolean;
  settled: boolean;
}

const ItemContext = /* @__PURE__ */ createContext<ItemContextValue>({
  distance: 0,
  current: true,
  newest: true,
  settled: false,
});

export interface TickerRootProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  readonly ref?: Ref<HTMLElement> | undefined;
  /** Makes the newest item breathe while it faces the reader, to show that work is going on. */
  active?: boolean | undefined;
  /** Shows only the item facing the reader, without its neighbours, such as a finished summary. */
  settled?: boolean | undefined;
  /**
   * Makes the ticker a button. A tap (not a drag) calls it with the key of the item the reader rolled to, or
   * `undefined` on the newest item. Without it, the ticker still scrolls but is neither focusable nor clickable.
   */
  onActivate?: ((key?: string) => void) | undefined;
  /** `Ticker.Item` elements with keys, oldest first. The last is the newest. */
  children?: ReactNode;
}

/**
 * One line showing the newest of a sequence, such as the step an agent is on. Items sit on a drum like iOS's picker:
 * a new item rolls in, and the reader can drag it, turn it with the mouse wheel, or (as a button) use the arrow keys
 * to roll back through earlier ones. Screen readers hear each new item's label politely.
 */
export function TickerRoot({
  ref,
  active = false,
  settled = false,
  onActivate,
  className,
  children,
  ...props
}: TickerRootProps) {
  const items: ReactElement<TickerItemProps>[] = [];
  // Children.forEach passes the elements as given, with their own keys.
  Children.forEach(children, (child) => {
    if (isValidElement<TickerItemProps>(child)) {
      items.push(child);
    }
  });
  const last = Math.max(0, items.length - 1);
  const [position, setPosition] = useState(last);
  const [drum] = useState(() => createDrum(last, setPosition));
  useEffect(() => {
    drum.setLast(last);
  }, [drum, last]);
  useEffect(() => () => drum.destroy(), [drum]);

  // Native listeners: React's wheel events are passive and cannot keep the page still; the pointer ones live beside it.
  const [element, setElement] = useState<HTMLElement | null>(null);
  const rootRef = useCallback(
    (node: HTMLElement | null) => {
      setElement(node);
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );
  useEffect(() => {
    if (!element) {
      return undefined;
    }
    const listeners = {
      wheel: drum.wheel,
      pointerdown: drum.pointerDown,
      pointermove: drum.pointerMove,
      pointerup: drum.pointerUp,
      pointercancel: drum.pointerCancel,
      lostpointercapture: drum.lostCapture,
      // A native drag (of text or an image inside) would take the pointer without ending the drum's drag.
      dragstart: (event: Event) => event.preventDefault(),
    } as const;
    element.addEventListener('wheel', listeners.wheel, {passive: false});
    element.addEventListener('pointerdown', listeners.pointerdown);
    element.addEventListener('pointermove', listeners.pointermove);
    element.addEventListener('pointerup', listeners.pointerup);
    element.addEventListener('pointercancel', listeners.pointercancel);
    element.addEventListener('lostpointercapture', listeners.lostpointercapture);
    element.addEventListener('dragstart', listeners.dragstart);
    // Switching away mid-drag (another window, an alert) ends the drag too.
    window.addEventListener('blur', listeners.lostpointercapture);
    return () => {
      element.removeEventListener('wheel', listeners.wheel);
      element.removeEventListener('pointerdown', listeners.pointerdown);
      element.removeEventListener('pointermove', listeners.pointermove);
      element.removeEventListener('pointerup', listeners.pointerup);
      element.removeEventListener('pointercancel', listeners.pointercancel);
      element.removeEventListener('lostpointercapture', listeners.lostpointercapture);
      element.removeEventListener('dragstart', listeners.dragstart);
      window.removeEventListener('blur', listeners.lostpointercapture);
    };
  }, [element, drum]);

  const currentIndex = Math.min(last, Math.max(0, Math.round(position)));
  const keyOf = (item: ReactElement | undefined) => (item?.key == null ? undefined : item.key);
  const shared = {
    ...props,
    ref: rootRef,
    className: classes(styles.root, className),
    'data-active': active || undefined,
    'data-settled': settled || undefined,
  };
  const drawn = (
    <span className={styles.drum}>
      {items.map((item, index) => {
        const distance = index - position;
        if (Math.abs(distance) > VISIBLE) {
          return null;
        }
        return (
          <ItemContext
            key={keyOf(item) ?? index}
            value={{
              distance,
              current: index === currentIndex,
              newest: index === items.length - 1,
              settled,
            }}
          >
            {item}
          </ItemContext>
        );
      })}
    </span>
  );
  const label = items[currentIndex]?.props.label;
  const announcement = (
    <span className={styles.announcement} aria-live="polite" aria-atomic="true">
      {items.at(-1)?.props.label}
    </span>
  );

  if (!onActivate) {
    return (
      <>
        <span {...shared}>{drawn}</span>
        {announcement}
      </>
    );
  }
  return (
    <>
      <button
        type="button"
        aria-label={label}
        {...shared}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          // Its own taps are its own: the row around it may open the same thing.
          event.stopPropagation();
          props.onClick?.(event);
          if (drum.takeDragged()) {
            return;
          }
          const index = drum.index();
          onActivate(index === items.length - 1 ? undefined : keyOf(items[index]));
        }}
        onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
          props.onKeyDown?.(event);
          if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            drum.step(event.key === 'ArrowUp' ? -1 : 1);
          }
        }}
      >
        {drawn}
      </button>
      {announcement}
    </>
  );
}

export interface TickerItemProps {
  /** The item as plain text: the ticker's accessible name while it faces the reader, and its live announcement. */
  label: string;
  /** Colors the item `semantic.color.text.negative` and its icons `semantic.color.icon.negative`, such as a failure. */
  negative?: boolean | undefined;
  /** What the item shows: usually an icon and a line of text, in a row. Text in an element ends in an ellipsis. */
  children?: ReactNode;
}

/** One item of the sequence. Its React `key` is what `onActivate` receives. */
export function TickerItem({negative = false, children}: TickerItemProps) {
  const {distance, current, newest, settled} = useContext(ItemContext);
  const opacity = settled && !current ? 0 : Math.max(0, 1 - Math.abs(distance) * FADE);
  return (
    <span
      className={styles.item}
      aria-hidden={current ? undefined : true}
      data-current={current || undefined}
      data-newest={newest || undefined}
      data-negative={negative || undefined}
      style={{
        transform: `translateZ(${-RADIUS}px) rotateX(${-distance * STEP}deg) translateZ(${RADIUS}px)`,
        opacity,
      }}
    >
      <span className={styles.content}>{children}</span>
    </span>
  );
}
