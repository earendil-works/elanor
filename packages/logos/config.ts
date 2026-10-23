/**
 * Logo sources and composition rules, mirroring the Figma logo components.
 *
 * Lengths are in source units: the symbol frame is 560 units wide, and one grid
 * unit is a quarter of that frame.
 */

/** Source drawings, stored as `sources/<brand>/<part>.svg`. */
export const parts = {
  mark: {required: true},
  /** Dedicated one-color drawing; brands without one use their mark. */
  'mark-monochrome': {required: false, fallback: 'mark'},
  wordmark: {required: true},
  'wordmark-small': {required: true},
} as const satisfies Record<string, {required: boolean; fallback?: string}>;

export type PartName = keyof typeof parts;

export interface LockupRule {
  direction: 'row' | 'column';
  gap: number;
  /** Padding above and below the lockup. */
  paddingBlock: number;
  /** Which wordmark drawing the lockup uses. */
  wordmark: PartName;
}

export interface BrandConfig {
  name: string;
  /** The mark is a traced painting with fixed colors: color treatments only, no React components. */
  painting?: boolean;
  /** Overrides of the shared lockup rules. */
  lockups?: Partial<Record<LockupName, Partial<LockupRule>>>;
}

export type LockupName = 'horizontal' | 'vertical';

/** Asset kinds: the symbol alone, and the symbol with the wordmark in each lockup. */
export type LogoKind = 'logo' | `logo-wordmark-${LockupName}`;

export const gridUnit = 140;

/** Minimum clear space around every logo asset. */
export const clearSpace = gridUnit;

export const lockups: Record<LockupName, LockupRule> = {
  horizontal: {direction: 'row', gap: 232, paddingBlock: 20, wordmark: 'wordmark'},
  vertical: {direction: 'column', gap: 140, paddingBlock: 0, wordmark: 'wordmark-small'},
};

export const brands = {
  earendil: {name: 'Earendil', lockups: {horizontal: {paddingBlock: 0}}},
  pi: {name: 'Pi'},
  radius: {name: 'Radius'},
  lefos: {name: 'Lefos'},
  elanor: {
    name: 'Elanor',
    painting: true,
    // The mark's frame is centered on the stamens, so it extends past the petals on the right and
    // bottom; the gaps subtract that extra space.
    lockups: {horizontal: {gap: 184.5}, vertical: {gap: 85}},
  },
} as const satisfies Record<string, BrandConfig>;

export type BrandId = keyof typeof brands;

/** Color treatments, named like the press kit folders. */
export const treatments = [
  {id: 'on-light', scheme: 'light', monochrome: false},
  {id: 'on-dark', scheme: 'dark', monochrome: false},
  {id: 'monochrome-on-light', scheme: 'light', monochrome: true},
  {id: 'monochrome-on-dark', scheme: 'dark', monochrome: true},
] as const;

export type Treatment = (typeof treatments)[number];

/** Each brand's own page background, used behind icons and avatars. */
export const backgroundToken = 'semantic.color.background.canvas';

export const logoTokens = {
  /** Source fills may only link to tokens in this group. */
  group: 'semantic.color.logo',
  /** Paints every shape of a monochrome logo. */
  monochrome: 'semantic.color.logo.monochrome',
};
