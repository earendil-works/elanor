import { token } from "../dtcg";
import type {
  GeneratedTokenPatch,
  GenerationConfig,
  RadiusRecipe,
} from "../types";
import { pixelsToRem } from "../units";

const BASE_PX = 3;
const BASE_STEP = 100;
const TOKEN_INCREMENT = 100;
const SCALE_RATIO = 2;
const FULL_RADIUS_REM = 100;

/**
 * Calculates the pixel radius for a token step.
 *
 * Token 100 represents the 3px base. Every increase of 100 doubles the radius,
 * so token 200 is 6px and token 300 is 12px.
 *
 * @param step The numeric token step.
 * @returns The radius in pixels.
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
      throw new Error("Radius steps must be in ascending order");
    }
  }
}

/**
 * Generates DTCG dimension tokens for the border-radius scale.
 *
 * Numeric tokens follow the 3px doubling scale. The named full token uses a
 * deliberately oversized radius so rectangular elements can become pills and
 * equal-sided elements can become circles without coupling it to their size.
 *
 * @param recipe The radius scale recipe.
 * @param config Global generation settings.
 * @returns Typed patches containing the generated radius tokens.
 */
export function generateRadiusTokens(
  recipe: RadiusRecipe,
  config: GenerationConfig,
): GeneratedTokenPatch[] {
  validateSteps(recipe.steps);
  const patches: GeneratedTokenPatch[] = recipe.steps.map((step) => ({
    type: "dimension",
    path: [...recipe.path, "dimension", "radius", String(step)],
    value: token({
      value: pixelsToRem(calculatePixels(step), config),
      unit: "rem",
    }),
  }));

  patches.push({
    type: "dimension",
    path: [...recipe.path, "dimension", "radius", "full"],
    value: token({
      value: FULL_RADIUS_REM,
      unit: "rem",
    }),
  });

  return patches;
}
