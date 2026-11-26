import {useSyncExternalStore} from 'react';

/** State that parts read through selectors, so each renders only when its own slice changes. */
export interface Store<State> {
  readonly get: () => State;
  /** Notifies subscribers unless `isEqual` finds the state unchanged. */
  readonly set: (state: State) => void;
  readonly subscribe: (listener: () => void) => () => void;
}

export function createStore<State>(
  initial: State,
  isEqual: (a: State, b: State) => boolean = Object.is,
): Store<State> {
  let current = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => current,
    set: (state) => {
      if (isEqual(state, current)) return;
      current = state;
      for (const listener of [...listeners]) listener();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/**
 * What `selector` picks from the store's state. Return a primitive or a stored reference: a new
 * object on every call would render again on every change of the store.
 */
export function useStoreSelector<State, Selected>(
  store: Store<State>,
  selector: (state: State) => Selected,
): Selected {
  const getSnapshot = () => selector(store.get());
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
