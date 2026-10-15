import type {Config} from 'stylelint';

import {DEFAULT_IGNORES, type RuleOptions} from './options.js';
import {
  rule as noHardcodedTokenValues,
  ruleName as noHardcodedTokenValuesName,
} from './rules/no-hardcoded-token-values.js';
import {
  rule as noNonTokenCustomProperties,
  ruleName as noNonTokenCustomPropertiesName,
} from './rules/no-non-token-custom-properties.js';
import {
  rule as preferSemanticToken,
  ruleName as preferSemanticTokenName,
} from './rules/prefer-semantic-token.js';
import {
  rule as tokenPropertyCompatibility,
  ruleName as tokenPropertyCompatibilityName,
} from './rules/token-property-compatibility.js';
import {
  rule as transitionTypeCompatibility,
  ruleName as transitionTypeCompatibilityName,
} from './rules/transition-type-compatibility.js';

const plugin = [
  {ruleName: noNonTokenCustomPropertiesName, rule: noNonTokenCustomProperties},
  {ruleName: noHardcodedTokenValuesName, rule: noHardcodedTokenValues},
  {ruleName: tokenPropertyCompatibilityName, rule: tokenPropertyCompatibility},
  {ruleName: transitionTypeCompatibilityName, rule: transitionTypeCompatibility},
  {ruleName: preferSemanticTokenName, rule: preferSemanticToken},
];

export interface StrictConfigOptions extends RuleOptions {
  reportNeedlessDisables?: boolean;
}

/**
 * Creates the shared strict configuration for one generated brand catalogue.
 *
 * @param options The catalogue path and rule configuration.
 * @returns A Stylelint configuration with every design-token rule enabled.
 */
export function createStrictConfig(options: StrictConfigOptions): Config {
  const {reportNeedlessDisables = true, ...ruleOptions} = options;
  return {
    plugins: plugin,
    ignoreFiles: [...DEFAULT_IGNORES, ...(ruleOptions.ignoreFiles ?? [])],
    reportNeedlessDisables,
    reportInvalidScopeDisables: true,
    reportDescriptionlessDisables: [true, {except: []}],
    rules: {
      [noNonTokenCustomPropertiesName]: [true, ruleOptions],
      [noHardcodedTokenValuesName]: [true, ruleOptions],
      [tokenPropertyCompatibilityName]: [true, ruleOptions],
      [transitionTypeCompatibilityName]: [true, ruleOptions],
      [preferSemanticTokenName]: [true, ruleOptions],
    },
  };
}

export {
  noHardcodedTokenValuesName,
  noNonTokenCustomPropertiesName,
  preferSemanticTokenName,
  tokenPropertyCompatibilityName,
  transitionTypeCompatibilityName,
};

export default plugin;
