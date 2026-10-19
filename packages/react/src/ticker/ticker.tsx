import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './ticker.module.css';

/** Degrees between neighbouring items on the drum, and the drum's radius in rem. */
const STEP = 38;
const RADIUS = 2.25;
/** How many items before the current one stay mounted; the rest have rolled out of sight. */
const KEEP = 3;

interface ItemContextValue {
  /** Faces from the one facing the reader: negative above, positive below. */
  distance: number;
  /** Whether this is the newest item, which screen readers hear. */
  newest: boolean;
}

const ItemContext = /* @__PURE__ */ createContext<ItemContextValue>({distance: 0, newest: true});

export interface TickerRootProps extends ComponentPropsWithRef<'span'> {
  /** Makes the current item breathe, to show that work is going on. */
  active?: boolean | undefined;
  /** Shows only the current item, without the previous one above it, such as a finished summary. */
  settled?: boolean | undefined;
}

/**
 * One line showing the newest of a sequence, such as the step an agent is on. Items sit on a drum: when a new one
 * arrives the drum rolls to it, and the previous item stays bent back above it. Children are `Ticker.Item` elements
 * with keys, oldest first; the last is current. Screen readers hear each new item's label politely.
 */
export function TickerRoot({
  active = false,
  settled = false,
  className,
  children,
  ...props
}: TickerRootProps) {
  const items = Children.toArray(children);
  const last = items.length - 1;
  const [shown, setShown] = useState(last);
  useEffect(() => {
    // Two frames: the new item is laid out below first, then the drum turns to it.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setShown(last));
    });
    return () => cancelAnimationFrame(frame);
  }, [last]);
  const start = Math.max(0, last - KEEP);
  return (
    <span
      aria-live="polite"
      aria-atomic="true"
      {...props}
      className={classes(styles.root, className)}
      data-active={active || undefined}
      data-settled={settled || undefined}
    >
      {items.slice(start).map((item, offset) => {
        const index = start + offset;
        return (
          <ItemContext
            key={isValidElement(item) ? item.key : index}
            value={{distance: index - shown, newest: index === last}}
          >
            {item}
          </ItemContext>
        );
      })}
    </span>
  );
}

export interface TickerItemProps {
  /** The item as plain text, for screen readers. */
  label: string;
  /** Colors the item `semantic.color.text.negative` and its icons `semantic.color.icon.negative`, such as a failure. */
  negative?: boolean | undefined;
  /** What the item shows: usually an icon and a line of text, in a row. Text in an element ends in an ellipsis. */
  children?: ReactNode;
}

/** One item of the sequence. */
export function TickerItem({label, negative = false, children}: TickerItemProps) {
  const {distance, newest} = useContext(ItemContext);
  return (
    <>
      {newest && <span className={styles.label}>{label}</span>}
      <span
        className={styles.item}
        aria-hidden="true"
        data-current={distance === 0 || undefined}
        data-neighbour={Math.abs(distance) === 1 || undefined}
        data-negative={negative || undefined}
        style={{
          transform: `translateZ(-${RADIUS}rem) rotateX(${-distance * STEP}deg) translateZ(${RADIUS}rem)`,
        }}
      >
        <span className={styles.content}>{children}</span>
      </span>
    </>
  );
}
