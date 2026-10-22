export interface Courier {
  readonly label: string;
  readonly href: string;
  /** Opens a page outside the docs, announced to assistive technology. */
  readonly external?: boolean;
}

const PACKAGES = 'https://github.com/earendil-works/elanor/tree/main/packages';

/** Clockwise from the top petal. Order matches the petal geometry in `garden/geometry.ts`. */
export const COURIERS: readonly Courier[] = [
  {label: 'Design tokens', href: `${PACKAGES}/design-tokens`, external: true},
  {label: 'Components', href: '/components/layout/'},
  {label: 'Icons', href: '/icons/'},
  {label: 'Fonts', href: `${PACKAGES}/fonts`, external: true},
  {label: 'Brand', href: '/brand/'},
];
