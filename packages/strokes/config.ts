/**
 * Brush stroke styles. Every shape's size comes from the brand's design
 * tokens, so strokes always match the real border radii and control sizes.
 * Token paths are resolved from `@earendil-works/design-tokens/<tokenBrand>.catalog.json`.
 */

export interface BrushConfig {
  /** A horizontal stroke drawn as closed filled paths. */
  source: string;
  /**
   * Evens out the stroke so it has no taper and both ends match, which lets it
   * close into a seamless loop. Only the part between `start` and `end`
   * (source x coordinates) is used; `smoothing` is the width, in source units,
   * over which the width envelope is averaged before being made uniform.
   */
  normalize: {start: number; end: number; smoothing: number};
}

export interface StrokeStyle {
  brush: string;
  tokenBrand: string;
  /** Stroke widths, as border-width tokens. `focus` replaces `default` while focused. */
  thickness: {default: string; focus: string};
  /** Number of variations per shape, so neighboring elements differ. */
  variants: number;
  seed: number;
  /** Gentle periodic width changes around a loop: cycles per loop and relative amplitude. */
  pressure: Array<{cycles: number; amplitude: number}>;
  shapes: {
    /** Rounded rectangles, one per radius token. */
    boxes: Record<string, string>;
    /** Fully rounded controls, one per height token. */
    pills: Record<string, string>;
    /** Circles, one per diameter token. */
    circles: Record<string, string>;
    /** Separators; `taper` is the length of each tapered end in pixels. */
    lines: {taper: number};
  };
}

export const brushes: Record<string, BrushConfig> = {
  noir: {source: "sources/noir.svg", normalize: {start: 10, end: 90, smoothing: 2}},
};

export const styles: Record<string, StrokeStyle> = {
  pencil: {
    brush: "noir",
    tokenBrand: "radius",
    thickness: {default: "semantic.dimension.borderWidth.default", focus: "semantic.dimension.borderWidth.large"},
    variants: 4,
    seed: 731,
    pressure: [
      {cycles: 3, amplitude: 0.045},
      {cycles: 7, amplitude: 0.025},
    ],
    shapes: {
      boxes: {
        small: "semantic.dimension.radius.small",
        medium: "semantic.dimension.radius.medium",
        large: "semantic.dimension.radius.large",
      },
      pills: {
        "x-small": "semantic.dimension.size.xSmall",
        small: "semantic.dimension.size.small",
        medium: "semantic.dimension.size.medium",
        large: "semantic.dimension.size.large",
      },
      circles: {
        "x-small": "semantic.dimension.size.xSmall",
        small: "semantic.dimension.size.small",
      },
      lines: {taper: 12},
    },
  },
};
