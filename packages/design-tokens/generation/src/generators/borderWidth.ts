import { token } from "../dtcg";
import type { BorderWidthRecipe, GeneratedTokenPatch } from "../types";

const BASE_PX = 1;
const BASE_STEP = 100;
const TOKEN_INCREMENT = 100;
const SCALE_RATIO = 2;

/**
 * Calculates the pixel width for a token step.
 *
 * Token 100 represents the 1px base. Every increase of 100 doubles the width,
 * so token 200 is 2px and token 300 is 4px.
 *
 * @param step The numeric token step.
 * @returns The border width in pixels.
 */
function calculatePixels(step: number): number {
  const scaleIndex = (step - BASE_STEP) / TOKEN_INCREMENT;
  return BASE_PX * SCALE_RATIO ** scaleIndex;
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
      throw new Error("Border width steps must be in ascending order");
    }
  }
}

/**
 * Generates DTCG dimension tokens for the border-width scale.
 *
 * Numeric tokens follow the 1px doubling scale and retain pixel units so each
 * value represents an intentional stroke width.
 *
 * @param recipe The border-width scale recipe.
 * @returns Typed patches containing the generated border-width tokens.
 */
export function generateBorderWidthTokens(
  recipe: BorderWidthRecipe,
): GeneratedTokenPatch[] {
  validateSteps(recipe.steps);
  return recipe.steps.map((step) => ({
    type: "dimension",
    path: [...recipe.path, "dimension", "borderWidth", String(step)],
    value: token({
      value: calculatePixels(step),
      unit: "px",
    }),
  }));
}
