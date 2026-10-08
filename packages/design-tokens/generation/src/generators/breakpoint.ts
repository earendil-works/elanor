import {token} from '../dtcg';
import type {BreakpointRecipe, GeneratedTokenPatch} from '../types';

const BASE_REM = 16;
const TOKEN_INCREMENT = 100;

/**
 * Calculates the viewport width for a token step.
 *
 * Token 100 represents 16rem. Every increase of 100 adds another 16rem,
 * while intermediate steps such as 250 preserve the same linear formula.
 *
 * @param step The numeric token step.
 * @returns The viewport width in rem.
 */
function calculateRem(step: number): number {
  return (step * BASE_REM) / TOKEN_INCREMENT;
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
      throw new Error('Breakpoint steps must be in ascending order');
    }
  }
}

/**
 * Generates DTCG dimension tokens for the viewport breakpoint scale.
 *
 * The generated values use rem so thresholds respond to the user's configured
 * default font size. Recipes select only the scale positions needed by layouts.
 *
 * @param recipe The breakpoint scale recipe.
 * @returns Typed patches containing the generated breakpoint tokens.
 */
export function generateBreakpointTokens(recipe: BreakpointRecipe): GeneratedTokenPatch[] {
  validateSteps(recipe.steps);
  return recipe.steps.map((step) => ({
    type: 'dimension',
    path: [...recipe.path, 'dimension', 'breakpoint', String(step)],
    value: token({
      value: calculateRem(step),
      unit: 'rem',
    }),
  }));
}
