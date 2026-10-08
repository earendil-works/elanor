import {round, token} from '../dtcg';
import type {GeneratedTokenPatch, GenerationConfig, JsonObject, TypographyRecipe} from '../types';
import {pixelsToRem} from '../units';

const CLASSICAL_FUNDAMENTAL_PX = 12;
const CLASSICAL_RATIO = 2;
const CLASSICAL_NOTES_PER_INTERVAL = 5;
const CLASSICAL_FIRST_TOKEN = 100;
const CLASSICAL_FIRST_INDEX = -1;
const CLASSICAL_TOKEN_INCREMENT = 100;
const LINE_HEIGHT_RATIO_PRECISION = 6;

/**
 * Converts a token step into its index in the classical scale.
 *
 * Token 100 represents index -1. Each increase of 100 advances one note.
 *
 * @param step The numeric token step.
 * @returns The corresponding classical scale index.
 */
function scaleIndexForStep(step: number): number {
  return CLASSICAL_FIRST_INDEX + (step - CLASSICAL_FIRST_TOKEN) / CLASSICAL_TOKEN_INCREMENT;
}

/**
 * Calculates one note in the classical typographic scale.
 *
 * The formula is fi = f0 * r^(i / n).
 *
 * @param index The note index in the scale.
 * @returns The calculated font size in pixels.
 */
function calculateFontSize(index: number): number {
  return CLASSICAL_FUNDAMENTAL_PX * CLASSICAL_RATIO ** (index / CLASSICAL_NOTES_PER_INTERVAL);
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
      throw new Error('Typography steps must be in ascending order');
    }
  }
}

/**
 * Checks grid-tier ordering that cannot be expressed in the recipe JSON Schema.
 *
 * The first tier must cover every possible font size. Later tiers are selected
 * by walking the array in ascending order.
 *
 * @param recipe The typography scale recipe.
 * @throws When the grid tiers do not start at zero or are not ascending.
 */
function validateGridTiers(recipe: TypographyRecipe): void {
  const {gridTiers} = recipe.lineHeight;

  if (gridTiers[0].minFontSizePx !== 0) {
    throw new Error('The first line-height grid tier must start at 0px');
  }

  for (let index = 1; index < gridTiers.length; index += 1) {
    if (gridTiers[index].minFontSizePx <= gridTiers[index - 1].minFontSizePx) {
      throw new Error('Line-height grid tiers must be in ascending font-size order');
    }
  }
}

/**
 * Selects the line-height grid for a rounded font size.
 *
 * @param recipe The typography scale recipe.
 * @param fontSizePx The rounded font size in pixels.
 * @returns The grid size from the highest matching tier.
 */
function gridPxForFontSize(recipe: TypographyRecipe, fontSizePx: number): number {
  let gridPx = recipe.lineHeight.gridTiers[0].gridPx;

  for (const tier of recipe.lineHeight.gridTiers.slice(1)) {
    if (fontSizePx < tier.minFontSizePx) {
      break;
    }
    gridPx = tier.gridPx;
  }

  return gridPx;
}

/**
 * Calculates the closest line height on the configured pixel grid tier.
 *
 * @param recipe The typography scale recipe.
 * @param fontSizePx The rounded font size in pixels.
 * @returns A line height in pixels that is divisible by the selected grid size.
 */
function calculateLineHeightPx(recipe: TypographyRecipe, fontSizePx: number): number {
  const {multiplier} = recipe.lineHeight;
  const gridPx = gridPxForFontSize(recipe, fontSizePx);
  const nearestGridValue = Math.round((fontSizePx * multiplier) / gridPx) * gridPx;
  const minimumGridValue = Math.ceil(fontSizePx / gridPx) * gridPx;
  return Math.max(nearestGridValue, minimumGridValue);
}

/**
 * Generates DTCG font size and line height tokens from the classical scale.
 *
 * @param recipe The typography scale recipe.
 * @param config Global generation settings.
 * @returns Typed patches containing generated font-size and line-height tokens.
 */
export function generateTypographyTokens(
  recipe: TypographyRecipe,
  config: GenerationConfig,
): GeneratedTokenPatch[] {
  validateSteps(recipe.steps);
  validateGridTiers(recipe);
  const fontSizes: JsonObject = {};
  const lineHeights: JsonObject = {};

  for (const step of recipe.steps) {
    const fontSizePx = Math.round(calculateFontSize(scaleIndexForStep(step)));
    const lineHeightPx = calculateLineHeightPx(recipe, fontSizePx);
    const lineHeightRatio = round(lineHeightPx / fontSizePx, LINE_HEIGHT_RATIO_PRECISION);

    fontSizes[String(step)] = token({
      value: pixelsToRem(fontSizePx, config),
      unit: 'rem',
    });
    lineHeights[String(step)] = token(lineHeightRatio);
  }

  return [
    {
      type: 'dimension',
      path: [...recipe.path, 'dimension', 'fontSize'],
      value: fontSizes,
    },
    {
      type: 'number',
      path: [...recipe.path, 'number', 'lineHeight'],
      value: lineHeights,
    },
  ];
}
