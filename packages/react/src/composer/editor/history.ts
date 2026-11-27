// Derived from TokenInput in vercel-labs/ui (https://github.com/vercel-labs/ui), Copyright 2026
// Vercel, Inc., licensed under the Apache License, Version 2.0, and modified. See
// THIRD-PARTY-NOTICES in this package.
//
// A run of typing or of deleting is one undo step until a pause, a `seal()` or an edit of another
// group. A run of recalled messages is one step however long it takes. Ungrouped edits are steps
// of their own. The editor decides what seals a step: see "Undo steps" on `Editor`'s `#commit`.

const LIMIT = 100;
/** Milliseconds. */
const GROUP_PAUSE = 500;

export type EditGroup = 'insert' | 'delete' | 'recall';

export class History<State> {
  #entries: State[];
  #index = 0;
  #current: State;
  #open: {readonly group: EditGroup; readonly at: number} | undefined;

  constructor(initial: State) {
    this.#entries = [initial];
    this.#current = initial;
  }

  current(): State {
    return this.#current;
  }

  record(state: State, group?: EditGroup): void {
    const at = Date.now();
    this.#entries = this.#entries.slice(0, this.#index + 1);
    const open = this.#open;
    if (group && open?.group === group && (group === 'recall' || at - open.at < GROUP_PAUSE)) {
      this.#entries[this.#index] = state;
    } else {
      this.#entries.push(state);
      if (this.#entries.length > LIMIT + 1) this.#entries.shift();
      this.#index = this.#entries.length - 1;
    }
    this.#current = state;
    this.#open = group ? {group, at} : undefined;
  }

  seal(): void {
    this.#open = undefined;
  }

  /** The state of the step before the current one. */
  previous(): State | undefined {
    return this.#entries[this.#index - 1];
  }

  /** Removes the current step, with nothing to redo, so the one before is current. */
  drop(): void {
    const state = this.previous();
    if (state === undefined) return;
    this.#entries = this.#entries.slice(0, this.#index);
    this.#index -= 1;
    this.#current = state;
    this.#open = undefined;
  }

  undo(): State | undefined {
    return this.#move(-1);
  }

  redo(): State | undefined {
    return this.#move(1);
  }

  #move(by: -1 | 1): State | undefined {
    this.#open = undefined;
    const state = this.#entries[this.#index + by];
    if (state === undefined) return undefined;
    this.#index += by;
    this.#current = state;
    return state;
  }
}
