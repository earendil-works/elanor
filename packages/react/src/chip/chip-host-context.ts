import {createContext} from 'react';

/**
 * Provided around a chip by a container that owns it, such as a composer's prompt drawing a chip
 * in its text. Not exported from the package: the dependency runs from the container to Chip.
 */
export interface ChipHostContextValue {
  /** Renders `data-selected` on `Chip.Root`. */
  readonly selected: boolean;
  /**
   * Called when `Chip.Remove` is pressed. `Chip.Remove` is then for pointers only: the keyboard
   * reaches the chip through the container, such as with Backspace in a text.
   */
  readonly remove: (event: MouseEvent) => void;
}

export const ChipHostContext = /* @__PURE__ */ createContext<ChipHostContextValue | null>(null);
