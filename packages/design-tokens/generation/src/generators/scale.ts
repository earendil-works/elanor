import {token} from '../dtcg';
import type {GeneratedTokenPatch, JsonObject, ScaleRecipe} from '../types';

const REST_SCALE_STEP = 1000;

/**
 * Checks ordering that cannot be expressed in the recipe JSON Schema.
 *
 * @param steps The configured scale steps.
 * @throws When the steps are not in ascending order.
 */
function validateSteps(steps: number[]): void {
  for (let index = 1; index < steps.length; index += 1) {
    if (steps[index] <= steps[index - 1]) {
      throw new Error('Scale steps must be in ascending order');
    }
  }
}

/**
 * Generates unitless DTCG number tokens for the transform scale factors.
 *
 * Token 1000 is the element's own size (a factor of 1), so token 980 is 0.98.
 *
 * @param recipe The scale recipe.
 * @returns Typed patches containing the generated scale tokens.
 */
export function generateScaleTokens(recipe: ScaleRecipe): GeneratedTokenPatch[] {
  validateSteps(recipe.steps);
  const steps: JsonObject = {};

  for (const step of recipe.steps) {
    steps[String(step)] = token(step / REST_SCALE_STEP);
  }

  return [
    {
      type: 'number',
      path: [...recipe.path, 'number', 'scale'],
      value: steps,
    },
  ];
}
