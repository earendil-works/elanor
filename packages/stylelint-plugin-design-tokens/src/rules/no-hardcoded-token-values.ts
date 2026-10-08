import type {Rule} from 'stylelint';

import type {RuleOptions} from '../options.js';
import {getCatalogue, isFoundation, isIgnored} from '../options.js';
import {tokenizableLiterals} from '../value-parser.js';
import {report} from './shared.js';

export const ruleName = 'design-tokens/no-hardcoded-token-values';

/**
 * Creates a Stylelint rule that rejects tokenizable literal values.
 *
 * Foundation and ignored files are excluded from enforcement.
 *
 * @param primary Whether the rule is enabled.
 * @param options The design-token rule options.
 * @returns The Stylelint lint function.
 */
export const rule: Rule<true, RuleOptions> = (primary, options) => (root, result) => {
  if (primary !== true || isIgnored(result, options) || isFoundation(result, options)) return;
  // Loading the catalogue also ensures literals are only enforced in a token
  // system with an explicitly selected brand.
  const catalogue = getCatalogue(options);
  const representedTypes = new Set(catalogue.tokens.map((token) => token.type));

  root.walkDecls((declaration) => {
    if (declaration.prop.startsWith('--')) return;
    const literals = tokenizableLiterals(declaration.prop, declaration.value, {
      allowUnitlessZero: options.allowUnitlessZero ?? true,
    });
    for (const literal of literals) {
      if (!representedTypes.has(literal.category)) continue;
      report(
        result,
        ruleName,
        declaration,
        `Unexpected hardcoded ${literal.category} value "${literal.value}"; use a ${catalogue.brand} design token.`,
        literal.value,
      );
    }
  });
};

rule.ruleName = ruleName;
rule.messages = {};
