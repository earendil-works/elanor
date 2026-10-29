import {Tooltip} from '@base-ui/react/tooltip';
import {useSyncExternalStore} from 'react';

import styles from './file-tree.module.css';

const DELAY_MS = 600;

type Source = 'hover' | 'focus';

interface OverflowTip {
  /** The cut-off label; the popup covers it exactly. */
  anchor: HTMLElement;
  text: string | null;
  source: Source;
  open: boolean;
}

export interface OverflowTooltipStore {
  /** Shows the row's full name if its label is cut off; otherwise closes the tooltip. */
  show: (row: HTMLElement | null, source: Source) => void;
  /** Closes the tooltip if `source` opened it. Returns whether it was open. */
  hide: (source: Source | 'all') => boolean;
  dispose: () => void;
  get: () => OverflowTip | null;
  subscribe: (listener: () => void) => () => void;
}

/**
 * One tooltip for the whole tree. State lives outside React, like the tab stop, so showing it
 * renders only the tooltip, never the rows.
 */
export function createOverflowTooltipStore(): OverflowTooltipStore {
  let tip: OverflowTip | null = null;
  let timeout = 0;
  const listeners = new Set<() => void>();
  const emit = (next: OverflowTip) => {
    tip = next;
    for (const listener of listeners) listener();
  };
  const close = () => {
    if (tip?.open) emit({...tip, open: false});
  };

  return {
    show(row, source) {
      window.clearTimeout(timeout);
      const label = row?.querySelector<HTMLElement>(`.${styles.label}`);
      if (!label || label.scrollWidth <= label.clientWidth) return close();
      const open = () => emit({anchor: label, text: label.textContent, source, open: true});
      // Focus shows at once; hover waits, unless a tooltip is already open (then it follows).
      if (source === 'focus' || tip?.open) open();
      else timeout = window.setTimeout(open, DELAY_MS);
    },
    hide(source) {
      window.clearTimeout(timeout);
      if (!tip?.open || (source !== 'all' && tip.source !== source)) return false;
      close();
      return true;
    },
    dispose: () => window.clearTimeout(timeout),
    get: () => tip,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

const getServerTip = () => null;

// Lay the popup over the label, so the full name continues the cut-off one in place.
const coverAnchor = ({anchor}: {anchor: {height: number}}) => -anchor.height;
const keepOverAnchor = {side: 'none', align: 'shift'} as const;

export function OverflowTooltip({store}: {store: OverflowTooltipStore}) {
  const tip = useSyncExternalStore(store.subscribe, store.get, getServerTip);
  // Nothing renders until a cut-off name is first hovered or focused.
  if (tip === null) return null;
  return (
    <Tooltip.Root
      open={tip.open}
      onOpenChange={(open) => {
        if (!open) store.hide('all');
      }}
      disableHoverablePopup
    >
      <Tooltip.Portal>
        <Tooltip.Positioner
          anchor={tip.anchor}
          side="bottom"
          align="start"
          sideOffset={coverAnchor}
          collisionAvoidance={keepOverAnchor}
        >
          {/* Visual only: the row's accessible name already holds the full text. */}
          <Tooltip.Popup className={styles.tooltip} aria-hidden>
            {tip.text}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
