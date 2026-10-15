import {token} from '../dtcg';
import type {DurationRecipe, GeneratedTokenPatch, JsonObject} from '../types';

/**
 * Checks ordering that cannot be expressed in the recipe JSON Schema.
 *
 * @param steps The configured duration steps.
 * @throws When the steps are not in ascending order.
 */
function validateSteps(steps: number[]): void {
  for (let index = 1; index < steps.length; index += 1) {
    if (steps[index] <= steps[index - 1]) {
      throw new Error('Duration steps must be in ascending order');
    }
  }
}

/**
 * Generates DTCG duration tokens where each step is its value in milliseconds.
 *
 * Token 150 is 150ms; token 0 is an instant change.
 *
 * @param recipe The duration scale recipe.
 * @returns Typed patches containing the generated duration tokens.
 */
export function generateDurationTokens(recipe: DurationRecipe): GeneratedTokenPatch[] {
  validateSteps(recipe.steps);
  const steps: JsonObject = {};

  for (const step of recipe.steps) {
    steps[String(step)] = token({value: step, unit: 'ms'});
  }

  return [
    {
      type: 'duration',
      path: [...recipe.path, 'duration'],
      value: steps,
    },
  ];
}
