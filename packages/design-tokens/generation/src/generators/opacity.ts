import {token} from '../dtcg';
import type {GeneratedTokenPatch, JsonObject, OpacityRecipe} from '../types';

const FULL_OPACITY_STEP = 1000;

/**
 * Converts an opacity step into a normalized alpha value.
 *
 * Token 0 is fully transparent and token 1000 is fully opaque, so token 150
 * represents 15% opacity with a value of 0.15.
 *
 * @param step The opacity scale step from 0 through 1000.
 * @returns The normalized opacity value from 0 through 1.
 */
function opacityForStep(step: number): number {
  return step / FULL_OPACITY_STEP;
}

/**
 * Checks ordering that cannot be expressed in the recipe JSON Schema.
 *
 * @param steps The configured opacity steps.
 * @throws When the steps are not in ascending order.
 */
function validateSteps(steps: number[]): void {
  for (let index = 1; index < steps.length; index += 1) {
    if (steps[index] <= steps[index - 1]) {
      throw new Error('Opacity steps must be in ascending order');
    }
  }
}

/**
 * Generates normalized DTCG number tokens for the opacity scale.
 *
 * @param recipe The opacity scale recipe.
 * @returns Typed patches containing the generated opacity tokens.
 */
export function generateOpacityTokens(recipe: OpacityRecipe): GeneratedTokenPatch[] {
  validateSteps(recipe.steps);
  const steps: JsonObject = {};

  for (const step of recipe.steps) {
    steps[String(step)] = token(opacityForStep(step));
  }

  return [
    {
      type: 'number',
      path: [...recipe.path, 'number', 'opacity'],
      value: steps,
    },
  ];
}
