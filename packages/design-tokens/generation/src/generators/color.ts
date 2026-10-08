import Color from 'colorjs.io';

import {round, token} from '../dtcg';
import type {
  ColorInteractiveState,
  ColorRecipe,
  ColorRecipeColor,
  ColorRecipeKey,
  GeneratedTokenPatch,
  JsonObject,
  JsonValue,
} from '../types';

const LAST_SCALE_STEP = 1000;
const BELL_CURVE_CENTER = 0.5;
const BELL_CURVE_SIGMA = 0.25;
const OKLCH_COMPONENT_PRECISION = 4;
const OKLCH_HUE_PRECISION = 2;
const TRANSPARENT_COLOR_NAME = 'transparent';
const PRINT_EXTENSION_KEY = 'com.earendil-works.print';
const SRGB_GAMUT_EPSILON = 0.0001;
const INTERACTIVE_STATE_MULTIPLIERS: Readonly<Record<ColorInteractiveState, number>> = {
  hover: 1,
  active: 2,
};

/**
 * Converts a token step into its position on the color scale.
 *
 * Step 0 is the white end of the scale and step 1000 is the black end.
 *
 * @param step The numeric token step.
 * @returns The scale position between 0 and 1.
 */
function scalePositionForStep(step: number): number {
  return step / LAST_SCALE_STEP;
}

/**
 * Maps a token step to OKHSL lightness.
 *
 * Token 0 is white and token 1000 is black, so lightness decreases linearly
 * from 1 to 0 along the scale.
 *
 * @param step The numeric token step.
 * @returns The OKHSL lightness between 0 and 1.
 */
function lightnessForStep(step: number): number {
  return 1 - scalePositionForStep(step);
}

/**
 * Evaluates the saturation bell curve at a scale position.
 *
 * The curve is a Gaussian centered on the middle of the scale, normalized so
 * it returns 0 at both ends and 1 at the center. This keeps near-white and
 * near-black steps close to the minimum saturation while mid-tones reach the
 * maximum.
 *
 * @param position The scale position between 0 and 1.
 * @returns The bell curve weight between 0 and 1.
 */
function bellCurveWeight(position: number): number {
  const gaussian = (x: number): number =>
    Math.exp(-((x - BELL_CURVE_CENTER) ** 2) / (2 * BELL_CURVE_SIGMA ** 2));
  const endWeight = gaussian(0);
  return (gaussian(position) - endWeight) / (1 - endWeight);
}

/**
 * Calculates the OKHSL saturation for a token step.
 *
 * Saturation follows the bell curve between the color's configured minimum at
 * the scale ends and maximum at the scale center.
 *
 * @param color The color definition from the recipe.
 * @param step The numeric token step.
 * @returns The OKHSL saturation between 0 and 1.
 */
function saturationForStep(
  saturation: NonNullable<ColorRecipeColor['saturation']>,
  step: number,
): number {
  const {min, max} = saturation;
  return min + (max - min) * bellCurveWeight(scalePositionForStep(step));
}

/**
 * Checks ordering that cannot be expressed in the recipe JSON Schema.
 *
 * @param steps The selected token steps.
 * @throws When the steps are not in ascending order.
 */
function validateSteps(steps: number[]): void {
  for (let index = 1; index < steps.length; index += 1) {
    if (steps[index] <= steps[index - 1]) {
      throw new Error('Color steps must be in ascending order');
    }
  }
}

/**
 * Expands interaction source steps into raw numeric palette positions.
 *
 * Interaction state names remain recipe-only metadata. Generated tokens are
 * ordinary primitive scale steps so their purpose is assigned by semantic
 * aliases rather than encoded in the primitive token path.
 *
 * @param recipe The color recipe containing core and optional interaction steps.
 * @returns All selected palette positions in ascending order.
 */
function expandedSteps(recipe: ColorRecipe): number[] {
  const selected = new Set(recipe.steps);
  const interactive = recipe.interactiveSteps;
  if (!interactive) return [...selected];

  validateSteps(interactive.lighterFrom);
  validateSteps(interactive.darkerFrom);

  const coreSteps = new Set(recipe.steps);
  const addGeneratedSteps = (sourceSteps: number[], direction: -1 | 1): void => {
    for (const sourceStep of sourceSteps) {
      if (sourceStep !== 0 && sourceStep !== LAST_SCALE_STEP && !coreSteps.has(sourceStep)) {
        throw new Error(
          `Interactive color source step ${sourceStep} must be a core step or a scale anchor`,
        );
      }

      for (const state of interactive.states) {
        const generatedStep =
          sourceStep + direction * interactive.distance * INTERACTIVE_STATE_MULTIPLIERS[state];

        if (generatedStep <= 0 || generatedStep >= LAST_SCALE_STEP) {
          throw new Error(
            `Interactive color step ${generatedStep} generated from ${sourceStep} for ${state} must be between 0 and ${LAST_SCALE_STEP}`,
          );
        }
        selected.add(generatedStep);
      }
    }
  };

  addGeneratedSteps(interactive.lighterFrom, -1);
  addGeneratedSteps(interactive.darkerFrom, 1);
  return [...selected].sort((first, second) => first - second);
}

/**
 * Checks color definitions that cannot be expressed in the recipe JSON Schema.
 *
 * @param colors The color definitions from the recipe.
 * @throws When names repeat, are reserved, a saturation range is inverted, or
 * a key color is outside sRGB.
 */
function validateColors(colors: ColorRecipeColor[]): void {
  const names = new Set<string>();

  for (const color of colors) {
    if (color.name === TRANSPARENT_COLOR_NAME) {
      throw new Error(`Color name ${color.name} is reserved for the generated transparent color`);
    }

    if (names.has(color.name)) {
      throw new Error(`Duplicate color name: ${color.name}`);
    }
    names.add(color.name);

    if (color.saturation && color.saturation.min > color.saturation.max) {
      throw new Error(`Color ${color.name} saturation min must not exceed its max`);
    }

    if (
      !new Color('oklch', color.key.components).inGamut('srgb', {
        epsilon: SRGB_GAMUT_EPSILON,
      })
    ) {
      throw new Error(
        `Color ${color.name} key oklch(${color.key.components.join(' ')}) is outside the sRGB gamut`,
      );
    }
  }
}

/**
 * Creates the token for a key color.
 *
 * The authored OKLCH components are kept exactly; only the hex fallback is
 * derived. Print builds are attached as an extension.
 *
 * @param key The authored key color.
 * @param print Optional CMYK builds per print profile.
 * @returns A DTCG color token in OKLCH with an sRGB hex fallback.
 */
function keyColorToken(key: ColorRecipeKey, print: ColorRecipeColor['print']): JsonObject {
  const components = [...key.components];
  const result = token({
    colorSpace: key.colorSpace,
    components,
    hex: hexFallback(components),
  });
  if (print) {
    result.$extensions = {[PRINT_EXTENSION_KEY]: {cmyk: print}};
  }
  return result;
}

/**
 * Rounds an OKLCH hue and wraps it back into its valid range.
 *
 * Rounding a hue just below 360 can produce 360, which the DTCG hue component
 * excludes, so the rounded value wraps around.
 *
 * @param hue The OKLCH hue in degrees.
 * @returns The rounded hue from 0 up to (but not including) 360.
 */
function roundHue(hue: number): number {
  return round(hue, OKLCH_HUE_PRECISION) % 360;
}

/**
 * Converts an OKHSL color to rounded DTCG OKLCH components.
 *
 * Achromatic colors have a powerless hue, which colorjs.io reports as null or
 * NaN. For compatibility with Terrazzo's Color.js adapter, they retain the
 * rounded input hue instead of using the otherwise-valid DTCG "none" keyword.
 *
 * @param hue The OKHSL hue in degrees.
 * @param saturation The OKHSL saturation between 0 and 1.
 * @param lightness The OKHSL lightness between 0 and 1.
 * @returns The rounded OKLCH lightness, chroma, and hue components.
 */
function oklchComponents(hue: number, saturation: number, lightness: number): JsonValue[] {
  const [oklchLightness, oklchChroma, oklchHue] = new Color('okhsl', [
    hue,
    saturation,
    lightness,
  ]).to('oklch').coords;

  return [
    round(oklchLightness ?? 0, OKLCH_COMPONENT_PRECISION),
    round(Math.max(0, oklchChroma ?? 0), OKLCH_COMPONENT_PRECISION),
    roundHue(oklchHue == null || Number.isNaN(oklchHue) ? hue : oklchHue),
  ];
}

/**
 * Calculates the sRGB hex fallback for rounded OKLCH components.
 *
 * The fallback is derived from the rounded components so it always describes
 * the same color. OKHSL maps onto the sRGB gamut by construction, so no gamut
 * mapping is needed.
 *
 * @param components The rounded OKLCH components.
 * @returns The color in 6-digit CSS hex notation.
 */
function hexFallback(components: JsonValue[]): string {
  const [lightness, chroma, hue] = components;
  return new Color('oklch', [
    lightness as number,
    chroma as number,
    hue === 'none' ? 0 : (hue as number),
  ])
    .to('srgb')
    .toString({format: 'hex', collapse: false});
}

/**
 * Creates a DTCG color token from OKHSL coordinates.
 *
 * @param hue The OKHSL hue in degrees.
 * @param saturation The OKHSL saturation between 0 and 1.
 * @param lightness The OKHSL lightness between 0 and 1.
 * @param alpha Optional alpha from 0 through 1.
 * @returns A DTCG color token in OKLCH with an sRGB hex fallback.
 */
function colorToken(
  hue: number,
  saturation: number,
  lightness: number,
  alpha?: number,
): JsonObject {
  const components = oklchComponents(hue, saturation, lightness);
  const value: JsonObject = {
    colorSpace: 'oklch',
    components,
    hex: hexFallback(components),
  };

  if (alpha !== undefined) {
    value.alpha = alpha;
  }

  return token(value);
}

/**
 * Generates DTCG color tokens from OKHSL color scales.
 *
 * Transparent is a constant rather than a design choice, so the generator
 * always emits it. Scales are calculated between pure white (step 0) and pure
 * black (step 1000), but those ends are not emitted; recipe colors such as the
 * brand black and white are authored as keys.
 *
 * Every recipe color has a key color. Without a saturation range it is emitted
 * as `<path>.color.<name>`. With one, the key becomes the group's `$root` and
 * a scale is generated as `<path>.color.<name>.<step>` at the key's hue, since
 * OKLCH and OKHSL share the same hue angle.
 *
 * @param recipe The color scale recipe.
 * @returns Typed patches containing the generated color tokens.
 */
export function generateColorTokens(recipe: ColorRecipe): GeneratedTokenPatch[] {
  validateSteps(recipe.steps);
  validateColors(recipe.colors);
  const selectedSteps = expandedSteps(recipe);
  const scales: JsonObject = {};

  scales[TRANSPARENT_COLOR_NAME] = colorToken(0, 0, 0, 0);

  for (const color of recipe.colors) {
    const key = keyColorToken(color.key, color.print);
    if (!color.saturation) {
      scales[color.name] = key;
      continue;
    }

    const hue = color.key.components[2];
    const steps: JsonObject = {$root: key};
    for (const step of selectedSteps) {
      steps[String(step)] = colorToken(
        hue,
        saturationForStep(color.saturation, step),
        lightnessForStep(step),
      );
    }

    scales[color.name] = steps;
  }

  return [
    {
      type: 'color',
      path: [...recipe.path, 'color'],
      value: scales,
    },
  ];
}
