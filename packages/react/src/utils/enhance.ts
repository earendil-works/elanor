/** An attached behavior. */
export interface Behavior {
  /** Removes the behavior's listeners and timers. */
  destroy(): void;
}

/** Attaches a behavior to an element that names it in `data-elanor`. */
export type BehaviorFactory = (element: HTMLElement) => Behavior;

/**
 * Attaches the registry's behaviors to the server-rendered components in `scope`. Components name
 * their behaviors in `data-elanor`, separated by spaces like a class list. Each behavior attaches
 * once per element and is recorded in `data-elanor-enhanced`, so calling `enhance` again, such as
 * after adding content, skips enhanced elements. Names missing from the registry are left alone,
 * so a page can bind its own behaviors.
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
