import {token} from '../dtcg';
import type {DimensionRecipe, GeneratedTokenPatch, GenerationConfig} from '../types';
import {pixelsToRem} from '../units';

const BASE_PX = 8;
const TOKEN_INCREMENT = 200;

/**
 * Calculates the pixel size for a token step.
 *
 * Token 200 represents the 8px base. Every increase of 200 adds another 8px,
 * so token 400 is 16px and token 25 is 1px.
 *
 * @param step The numeric token step.
 * @returns The size in pixels.
 */
function calculatePixels(step: number): number {
  return (step * BASE_PX) / TOKEN_INCREMENT;
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
      throw new Error('Dimension steps must be in ascending order');
    }
  }
}

/**
 * Generates DTCG dimension tokens from the linear 8px scale.
 *
 * Each step owns its token path directly in the dimension namespace so the
 * scale can share it with sibling groups such as the typography font sizes.
 *
 * @param recipe The dimension scale recipe.
 * @param config Global generation settings.
 * @returns Typed patches containing the generated dimension tokens.
 */
export function generateDimensionTokens(
  recipe: DimensionRecipe,
  config: GenerationConfig,
): GeneratedTokenPatch[] {
  validateSteps(recipe.steps);
  const patches: GeneratedTokenPatch[] = [];

  for (const step of recipe.steps) {
    patches.push({
      type: 'dimension',
      path: [...recipe.path, 'dimension', String(step)],
      value: token({
        value: pixelsToRem(calculatePixels(step), config),
        unit: 'rem',
      }),
    });
  }

  return patches;
}
