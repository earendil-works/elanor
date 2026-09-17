import type { AtRule, Declaration } from "postcss";
import stylelint from "stylelint";

/**
 * Reports a Stylelint warning for a declaration or at-rule.
 *
 * @param result The Stylelint result receiving the warning.
 * @param ruleName The name of the rule reporting the warning.
 * @param node The PostCSS node associated with the warning.
 * @param message The warning message.
 * @param word The specific word to highlight, when available.
 */
export function report(
  result: Parameters<typeof stylelint.utils.report>[0]["result"],
  ruleName: string,
  node: Declaration | AtRule,
  message: string,
  word?: string,
): void {
  stylelint.utils.report({ result, ruleName, node, message, ...(word ? { word } : {}) });
}
