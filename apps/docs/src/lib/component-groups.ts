import {getCollection, type CollectionEntry} from 'astro:content';

import {
  componentCategories,
  componentCategoryLabels,
  type ComponentCategory,
} from './component-categories.ts';

export interface ComponentGroup {
  readonly category: ComponentCategory;
  readonly label: string;
  /** Sorted by id. */
  readonly entries: readonly CollectionEntry<'components'>[];
}

/** Component pages grouped by their `category`, in category order, without empty groups. */
export async function componentGroups(): Promise<readonly ComponentGroup[]> {
  const entries = (await getCollection('components')).sort((a, b) => a.id.localeCompare(b.id));
  return componentCategories
    .map((category) => ({
      category,
      label: componentCategoryLabels[category],
      entries: entries.filter((entry) => entry.data.category === category),
    }))
    .filter((group) => group.entries.length > 0);
}
