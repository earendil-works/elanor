import type {AtRule, Declaration} from 'postcss';
import stylelint from 'stylelint';

import type {CatalogueToken} from '../catalogue.js';

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
  result: Parameters<typeof stylelint.utils.report>[0]['result'],
  ruleName: string,
  node: Declaration | AtRule,
  message: string,
  word?: string,
): void {
  stylelint.utils.report({result, ruleName, node, message, ...(word ? {word} : {})});
}

/**
 * Gets the source path used to evaluate a token's semantic role.
 *
 * @param token The catalogue token to inspect.
 * @returns The source token path for aliases, otherwise the token's own path.
 */
export function rolePath(token: CatalogueToken): string {
  return token.sourceToken ?? token.path;
}

/**
 * Checks whether a token path belongs to a configured semantic role.
 *
 * @param tokenPath The dot-separated token path.
 * @param prefix The accepted role prefix.
 * @returns Whether the path equals or descends from the role prefix.
 */
export function matchesRolePrefix(tokenPath: string, prefix: string): boolean {
  const basePath = prefix.replace(/\.+$/, '');
  return tokenPath === basePath || tokenPath.startsWith(`${basePath}.`);
}
