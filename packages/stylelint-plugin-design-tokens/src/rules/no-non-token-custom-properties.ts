import type { Rule } from "stylelint";
import valueParser from "postcss-value-parser";
import { customPropertiesInValue } from "../value-parser.js";
import type { RuleOptions } from "../options.js";
import { getCatalogue, isAllowedCustomProperty, isFoundation, isIgnored } from "../options.js";
import { report } from "./shared.js";

export const ruleName = "design-tokens/no-non-token-custom-properties";

/**
 * Creates a Stylelint rule that rejects unknown custom property definitions and references.
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

  const check = (name: string, node: Parameters<typeof report>[2]): void => {
    if (catalogue.tokensByVariable.has(name) || isAllowedCustomProperty(name, options)) return;
    report(result, ruleName, node, `Unknown custom property "${name}" for brand "${catalogue.brand}".`, name);
  };

  root.walkDecls((declaration) => {
    if (declaration.prop.startsWith("--")) check(declaration.prop, declaration);
    for (const name of customPropertiesInValue(declaration.value)) check(name, declaration);
  });

  root.walkAtRules((atRule) => {
    const atName = atRule.name.toLowerCase();
    // Media-query policy is intentionally outside this plugin. Breakpoint
    // tokens remain ordinary catalogue variables, but @media parameters are
    // neither interpreted nor validated.
    if (atName !== "media" && atName !== "custom-media") {
      for (const name of customPropertiesInValue(atRule.params)) check(name, atRule);
    }
    if (atName === "supports") {
      valueParser(atRule.params).walk((node) => {
        if (node.type === "word" && node.value.startsWith("--")) check(node.value, atRule);
      });
    }
    if (atName === "property") {
      const name = atRule.params.trim().split(/\s/u)[0];
      if (name?.startsWith("--")) check(name, atRule);
    }
  });
};

rule.ruleName = ruleName;
rule.messages = {};
