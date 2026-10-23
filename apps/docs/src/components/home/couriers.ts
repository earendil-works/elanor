export interface Courier {
  readonly label: string;
  readonly href: string;
}

/** Clockwise from the top petal. Order matches the petal geometry in `garden/geometry.ts`. */
export const COURIERS: readonly Courier[] = [
  {label: 'Design tokens', href: '/tokens/'},
  {label: 'Components', href: '/components/'},
  {label: 'Icons', href: '/icons/'},
  {label: 'Fonts', href: '/fonts/'},
  {label: 'Brand', href: '/brand/'},
];
