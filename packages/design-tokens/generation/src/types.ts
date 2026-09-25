export type JsonPrimitive = boolean | number | string | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };
export type DtcgToken = JsonObject & { $value: JsonValue };

export type GeneratorName =
  | "borderWidth"
  | "breakpoint"
  | "color"
  | "dimension"
  | "opacity"
  | "radius"
  | "typography";

export type DtcgTokenType =
  | "border"
  | "color"
  | "cubicBezier"
  | "dimension"
  | "duration"
  | "fontFamily"
  | "fontWeight"
  | "gradient"
  | "number"
  | "shadow"
  | "strokeStyle"
  | "transition"
  | "typography";

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

export interface ColorRecipeColor {
  name: string;
  hue: number;
  saturation: {
    min: number;
    max: number;
  };
  brand?: ColorRecipeBrand;
}

/** An exact brand color that shares its family's hue. */
export interface ColorRecipeBrand {
  hex: string;
  /** Set when the family's hue intentionally differs from the brand color. */
  allowHueShift?: boolean;
  /** Print builds as CMYK percentages. */
  cmyk?: Record<string, [number, number, number, number]>;
}

export type ColorInteractiveState = "hover" | "active";

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
