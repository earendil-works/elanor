export interface Behavior {
  destroy(): void;
}

export type BehaviorFactory = (element: HTMLElement) => Behavior;

// Kept out of the markup so enhancing before React hydrates doesn't change attributes React renders.
const attachedBehaviors = new WeakMap<Element, Set<string>>();

/**
 * Attaches each behavior once to the elements in `scope` that name it in `data-elanor`. Its
 * `destroy()` detaches it, so `enhance` can attach it again.
 */
export function enhance(
  behaviors: Readonly<Record<string, BehaviorFactory>>,
  scope: Pick<ParentNode, 'querySelectorAll'> = document,
): Behavior[] {
  const created: Behavior[] = [];
  for (const element of scope.querySelectorAll<HTMLElement>('[data-elanor]')) {
    const attached = attachedBehaviors.get(element) ?? new Set();
    attachedBehaviors.set(element, attached);
    for (const name of element.dataset.elanor?.split(/\s+/) ?? []) {
      const create = behaviors[name];
      if (!create || attached.has(name)) continue;
      attached.add(name);
      const behavior = create(element);
      created.push({
        destroy() {
          behavior.destroy();
          attached.delete(name);
        },
      });
    }
  }
  return created;
}
