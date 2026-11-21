// Derived from TokenInput in vercel-labs/ui (https://github.com/vercel-labs/ui), Copyright 2026
// Vercel, Inc., licensed under the Apache License, Version 2.0, and modified. See
// THIRD-PARTY-NOTICES in this package.
//
// A run of typing or of deleting is one undo step until a pause, a `seal()` or an edit of another
// group. Ungrouped edits are steps of their own.

const LIMIT = 100;
/** Milliseconds. */
const GROUP_PAUSE = 500;

export type EditGroup = 'insert' | 'delete';

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
    if (group && this.#open?.group === group && at - this.#open.at < GROUP_PAUSE) {
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
