import type {End} from "./scripts/lib/geometry.js";

/**
 * Brush stroke styles. A style is built for each of its brands, from that
 * brand's design tokens (`@earendil-works/design-tokens/<brand>.catalog.json`),
 * so strokes always match the brand's border radii and control sizes.
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
  /** The brands the style is built for; each gets `<style>/<brand>.css`. */
  brands: string[];
  /**
   * The bands strokes draw, inside the element's edge, as border-width tokens.
   * An element's background stops at its band. `focus` replaces `default`
   * while focused.
   */
  thickness: {default: string; focus: string};
  /**
   * How far, in pixels, a shape's stroke always reaches past its band, over
   * the element's background, so no seam shows between the two. The rough edge
   * of the brush faces out and wobbles within the band; the smooth edge faces in.
   */
  overlap: number;
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
  /**
   * Marks inside controls, painted in a color rather than outlined: a check,
   * a dash, and a dot (radio dots, switch knobs). They are drawn in a square
   * of `size` with a brush of `thickness` (tokens), and scale with their
   * element. `check` and `dash` are paths in fractions of the square, drawn
   * as one stroke each, with `ends` shaping its start and end; the dot fills
   * the square.
   */
  marks: {
    size: string;
    thickness: string;
    ends: {start: End; end: End};
    check: Array<[number, number]>;
    dash: Array<[number, number]>;
  };
}

export const brushes: Record<string, BrushConfig> = {
  noir: {source: "sources/noir.svg", normalize: {start: 10, end: 90, smoothing: 2}},
};

export const styles: Record<string, StrokeStyle> = {
  pencil: {
    brush: "noir",
    brands: ["radius"],
    thickness: {default: "semantic.dimension.borderWidth.default", focus: "semantic.dimension.borderWidth.large"},
    overlap: 0.5,
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
    marks: {
      size: "semantic.dimension.size.xSmall",
      thickness: "semantic.dimension.borderWidth.medium",
      ends: {start: {shape: "round", length: 1}, end: {shape: "point", length: 4}},
      check: [
        [0.2, 0.5],
        [0.42, 0.72],
        [0.82, 0.28],
      ],
      dash: [
        [0.25, 0.5],
        [0.75, 0.5],
      ],
    },
  },
};
