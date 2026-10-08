export type JsonPrimitive = boolean | number | string | null;
export type JsonValue = JsonPrimitive | JsonValue[] | {[key: string]: JsonValue};
export type JsonObject = {[key: string]: JsonValue};
export type DtcgToken = JsonObject & {$value: JsonValue};

export type GeneratorName =
  | 'borderWidth'
  | 'breakpoint'
  | 'color'
  | 'dimension'
  | 'opacity'
  | 'radius'
  | 'typography';

export type DtcgTokenType =
  | 'border'
  | 'color'
  | 'cubicBezier'
  | 'dimension'
  | 'duration'
  | 'fontFamily'
  | 'fontWeight'
  | 'gradient'
  | 'number'
  | 'shadow'
  | 'strokeStyle'
  | 'transition'
  | 'typography';

export interface GeneratedTokenPatch {
  path: string[];
  value: JsonObject;
  type: DtcgTokenType;
}

export interface GenerationConfig {
  $schema?: string;
  pixelsPerRem: number;
}

export interface BorderWidthRecipe {
  $schema?: string;
  path: string[];
  steps: number[];
}

export interface BreakpointRecipe {
  $schema?: string;
  path: string[];
  steps: number[];
}

export interface DimensionRecipe {
  $schema?: string;
  path: string[];
  steps: number[];
}

export interface RadiusRecipe {
  $schema?: string;
  path: string[];
  steps: number[];
}

export interface OpacityRecipe {
  $schema?: string;
  path: string[];
  steps: number[];
}

export interface TypographyGridTier {
  minFontSizePx: number;
  gridPx: number;
}

export interface TypographyRecipe {
  $schema?: string;
  path: string[];
  steps: number[];
  lineHeight: {
    multiplier: number;
    gridTiers: TypographyGridTier[];
  };
}

/**
 * A named key color, optionally with a generated scale at the key's hue. With
 * a scale, the key becomes the scale group's `$root`.
 */
export interface ColorRecipeColor {
  name: string;
  /** The defining color, in the same shape as a DTCG color value. */
  key: ColorRecipeKey;
  /** Saturation range of the scale; omit for a standalone color. */
  saturation?: {
    min: number;
    max: number;
  };
  /** CMYK builds of the key color as percentages, per print profile. */
  print?: Record<string, [number, number, number, number]>;
}

/** An OKLCH key color: lightness 0–1, chroma, and hue in degrees. */
export interface ColorRecipeKey {
  colorSpace: 'oklch';
  components: [number, number, number];
}

export type ColorInteractiveState = 'hover' | 'active';

export interface ColorInteractiveSteps {
  distance: number;
  states: ColorInteractiveState[];
  lighterFrom: number[];
  darkerFrom: number[];
}

export interface ColorRecipe {
  $schema?: string;
  path: string[];
  steps: number[];
  interactiveSteps?: ColorInteractiveSteps;
  colors: ColorRecipeColor[];
}

export interface GenerationMarker {
  [key: string]: JsonValue;
  source: string;
}
