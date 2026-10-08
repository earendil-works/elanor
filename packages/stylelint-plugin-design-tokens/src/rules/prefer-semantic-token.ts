import type {Rule} from 'stylelint';

import type {RuleOptions} from '../options.js';
import {getCatalogue, isFoundation, isIgnored} from '../options.js';
import {customPropertiesInValue} from '../value-parser.js';
import {report} from './shared.js';

export const ruleName = 'design-tokens/prefer-semantic-token';

/**
 * Creates a Stylelint rule that rejects primitive tokens in application styles.
 *
 * Foundation and ignored files are excluded from enforcement.
 *
 * @param primary Whether the rule is enabled.
 * @param options The design-token rule options.
 * @returns The Stylelint lint function.
 */
export const rule: Rule<true, RuleOptions> = (primary, options) => (root, result) => {
  if (primary !== true || isIgnored(result, options) || isFoundation(result, options)) return;
  const catalogue = getCatalogue(options);

  root.walkDecls((declaration) => {
    if (declaration.prop.startsWith('--')) return;
    for (const variable of customPropertiesInValue(declaration.value)) {
      const token = catalogue.tokensByVariable.get(variable);
      if (token?.tier !== 'primitive') continue;
      report(
        result,
        ruleName,
        declaration,
        `Primitive token "${variable}" is not allowed in application styles; choose a semantic token for the intended role.`,
        variable,
      );
    }
  });
};

rule.ruleName = ruleName;
rule.messages = {};
