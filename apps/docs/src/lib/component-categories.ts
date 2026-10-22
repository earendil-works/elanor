/**
 * Component categories in display order. Each component page sets one as `category` in its front
 * matter; the docs group the sidebar, the components overview, and llms.txt by it.
 */
export const componentCategories = [
  'layout',
  'navigation',
  'actions',
  'forms',
  'search',
  'overlays',
  'data',
  'feedback',
  'content',
] as const;

export type ComponentCategory = (typeof componentCategories)[number];

export const componentCategoryLabels: Readonly<Record<ComponentCategory, string>> = {
  layout: 'Layout',
  navigation: 'Navigation',
  actions: 'Actions',
  forms: 'Forms',
  search: 'Search & filtering',
  overlays: 'Overlays & disclosure',
  data: 'Data',
  feedback: 'Feedback & status',
  content: 'Content & typography',
};
