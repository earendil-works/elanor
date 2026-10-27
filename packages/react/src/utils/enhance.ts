export interface Behavior {
  destroy(): void;
}

export type BehaviorFactory = (element: HTMLElement) => Behavior;

/** Attaches each behavior once to the elements in `scope` that name it in `data-elanor`. */
export function enhance(
  behaviors: Readonly<Record<string, BehaviorFactory>>,
  scope: Pick<ParentNode, 'querySelectorAll'> = document,
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
