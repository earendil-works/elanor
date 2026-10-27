// Binds Elanor's behaviors to components rendered on the server, for pages without React in the
// browser. Components carry `data-elanor` with one or more behavior names separated by spaces,
// like a class list; `enhance` attaches each named behavior once per element and records it in
// `data-elanor-enhanced`, so calling it again, such as after adding content, skips elements it
// already enhanced. Behaviors not in the registry are left alone, so a page can bind its own.

/** An attached behavior. */
export interface Behavior {
  /** Removes the behavior's listeners and timers. */
  destroy(): void;
}

/** Attaches a behavior to an element that names it in `data-elanor`. */
export type BehaviorFactory = (element: HTMLElement) => Behavior;

/**
 * Attaches the registry's behaviors to the elements in `scope` that name them in `data-elanor`,
 * and returns them.
 */
export function enhance(
  behaviors: Readonly<Record<string, BehaviorFactory>>,
  scope: ParentNode = document,
): Behavior[] {
  const created: Behavior[] = [];
  for (const element of scope.querySelectorAll<HTMLElement>('[data-elanor]')) {
    const attached = new Set(element.dataset.elanorEnhanced?.split(' '));
    for (const name of element.dataset.elanor?.split(/\s+/) ?? []) {
      const create = behaviors[name];
      if (!create || attached.has(name)) continue;
      attached.add(name);
      element.dataset.elanorEnhanced = [...attached].join(' ');
      created.push(create(element));
    }
  }
  return created;
}
