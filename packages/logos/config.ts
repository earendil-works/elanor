/**
 * Logo composition rules, mirroring the Figma logo components.
 *
 * Lengths are in source units: the symbol frame is 560 units wide, and one grid
 * unit (a quarter of that frame) is also the minimum clear space.
 */
export interface LockupRule {
  direction: "row" | "column";
  gap: number;
  /** Padding above and below the lockup. */
  paddingBlock: number;
  /** Which wordmark drawing the lockup uses. */
  wordmark: "wordmark" | "wordmark-small";
}

export interface BrandConfig {
  name: string;
  /** Overrides of the shared lockup rules. */
  lockups?: Partial<Record<LockupName, Partial<LockupRule>>>;
}

export type LockupName = "horizontal" | "stacked";

export const gridUnit = 140;

export const lockups: Record<LockupName, LockupRule> = {
  horizontal: {direction: "row", gap: 232, paddingBlock: 20, wordmark: "wordmark"},
  stacked: {direction: "column", gap: 140, paddingBlock: 0, wordmark: "wordmark-small"},
};

export const brands = {
  earendil: {name: "Earendil", lockups: {horizontal: {paddingBlock: 0}}},
  pi: {name: "Pi"},
  radius: {name: "Radius"},
  lefos: {name: "Lefos"},
} as const satisfies Record<string, BrandConfig>;

export type BrandId = keyof typeof brands;

/** Color treatments, named like the press kit folders. */
export const treatments = [
  {id: "on-light", scheme: "light", monochrome: false},
  {id: "on-dark", scheme: "dark", monochrome: false},
  {id: "monochrome-on-light", scheme: "light", monochrome: true},
  {id: "monochrome-on-dark", scheme: "dark", monochrome: true},
] as const;

export type Treatment = (typeof treatments)[number];

/** The design-tokens build whose resolved logo colors are used. Logo tokens are shared by every brand. */
export const tokenBrand = "radius";
