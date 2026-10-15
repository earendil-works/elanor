import {token} from '../dtcg';
import type {GeneratedTokenPatch, JsonObject, LayerRecipe} from '../types';

/** The stacking value one level below the base, for content placed behind its siblings. */
const BELOW_VALUE = -1;

/**
 * Checks ordering that cannot be expressed in the recipe JSON Schema.
 *
 * @param steps The configured layer steps.
 * @throws When the steps are not in ascending order.
 */
function validateSteps(steps: number[]): void {
  for (let index = 1; index < steps.length; index += 1) {
    if (steps[index] <= steps[index - 1]) {
      throw new Error('Layer steps must be in ascending order');
    }
  }
}

/**
 * Generates DTCG number tokens for the stacking-level scale.
 *
 * Each numeric step is its own stacking value, so token 100 stacks at 100. The
 * recipe's steps grow by a factor of ten so new levels fit between existing
 * ones. The generator also always emits `below` (-1): a negative step cannot be
 * a token name, because CSS custom property names drop the minus sign.
 *
 * @param recipe The layer scale recipe.
 * @returns Typed patches containing the generated layer tokens.
 */
export function generateLayerTokens(recipe: LayerRecipe): GeneratedTokenPatch[] {
  validateSteps(recipe.steps);
  const steps: JsonObject = {below: token(BELOW_VALUE)};

  for (const step of recipe.steps) {
    steps[String(step)] = token(step);
  }

  return [
    {
      type: 'number',
      path: [...recipe.path, 'number', 'layer'],
      value: steps,
    },
  ];
}
