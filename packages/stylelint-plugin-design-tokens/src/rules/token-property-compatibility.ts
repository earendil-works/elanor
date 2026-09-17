import { minimatch } from "minimatch";
import type { Rule } from "stylelint";
import type { CatalogueToken } from "../catalogue.js";
import type { RuleOptions } from "../options.js";
import { getCatalogue, isFoundation, isIgnored } from "../options.js";
import { customPropertiesInValue } from "../value-parser.js";
import { report } from "./shared.js";

export const ruleName = "design-tokens/token-property-compatibility";

const DEFAULT_TYPES: Record<string, string[]> = {
  "color": ["color"],
  "*-color": ["color"],
  "background": ["color", "dimension"],
  "border": ["color", "dimension", "strokeStyle"],
  "border-*": ["color", "dimension", "strokeStyle"],
  "border-color": ["color"],
  "border-width": ["dimension"],
  "border-radius": ["dimension"],
  "outline": ["color", "dimension", "strokeStyle"],
  "outline-*": ["color", "dimension", "strokeStyle"],
  "outline-color": ["color"],
  "outline-width": ["dimension"],
  "outline-offset": ["dimension"],
  "fill": ["color"],
  "stroke": ["color", "dimension"],
  "margin*": ["dimension"],
  "padding*": ["dimension"],
  "gap": ["dimension"],
  "row-gap": ["dimension"],
  "column-gap": ["dimension"],
  "inset*": ["dimension"],
  "top": ["dimension"],
  "right": ["dimension"],
  "bottom": ["dimension"],
  "left": ["dimension"],
  "width": ["dimension"],
  "height": ["dimension"],
  "inline-size": ["dimension"],
  "block-size": ["dimension"],
  "min-*": ["dimension"],
  "max-*": ["dimension"],
  "scroll-margin*": ["dimension"],
  "scroll-padding*": ["dimension"],
  "grid-template*": ["dimension"],
  "transform": ["dimension", "number"],
  "transform-origin": ["dimension"],
  "flex-basis": ["dimension"],
  "z-index": ["number"],
  "aspect-ratio": ["number"],
  "font-family": ["fontFamily"],
  "font-size": ["dimension"],
  "font-weight": ["fontWeight"],
  "line-height": ["number", "dimension"],
  "letter-spacing": ["dimension"],
  "font": ["typography", "fontFamily", "fontWeight", "dimension", "number"],
  "opacity": ["number"],
  "box-shadow": ["shadow", "color", "dimension"],
  "text-shadow": ["shadow", "color", "dimension"],
};

const DEFAULT_ROLES: Record<string, string[]> = {
  // CSS properties are paint mechanisms, not a one-to-one semantic taxonomy:
  // icons inherit currentColor, separators paint borders with backgrounds, and
  // filled controls can extend their fill or focus treatment through a border.
  "color": ["semantic.color.text.", "semantic.color.icon."],
  "background": ["semantic.color.background.", "semantic.color.border."],
  "background-color": ["semantic.color.background.", "semantic.color.border."],
  "border": ["semantic.color.border.", "semantic.color.background.", "semantic.color.focusRing.", "semantic.dimension.borderWidth."],
  "border-*": ["semantic.color.border.", "semantic.color.background.", "semantic.color.focusRing.", "semantic.dimension.borderWidth.", "semantic.dimension.radius."],
  "border-color": ["semantic.color.border.", "semantic.color.background.", "semantic.color.focusRing."],
  "border-width": ["semantic.dimension.borderWidth."],
  "border-radius": ["semantic.dimension.radius."],
  "outline": ["semantic.color.focusRing.", "semantic.dimension.borderWidth."],
  "outline-*": ["semantic.color.focusRing.", "semantic.dimension.borderWidth."],
  "outline-color": ["semantic.color.focusRing."],
  "outline-width": ["semantic.dimension.borderWidth."],
  "fill": ["semantic.color.icon."],
  "stroke": ["semantic.color.icon."],
  "z-index": ["semantic.number.layer."],
  "opacity": ["semantic.number.opacity."],
  "padding*": ["semantic.dimension.space.padding.", "semantic.dimension.space.control.padding."],
  "gap": ["semantic.dimension.space.gap.", "semantic.dimension.space.control.gap."],
  "row-gap": ["semantic.dimension.space.gap.", "semantic.dimension.space.control.gap."],
  "column-gap": ["semantic.dimension.space.gap.", "semantic.dimension.space.control.gap."],
};

/**
 * Resolves values configured for an exact property or matching property globs.
 *
 * @param property The normalized CSS property name.
 * @param map The property patterns and their configured values.
 * @returns The unique configured values, or `undefined` when no pattern matches.
 */
function valuesFor(property: string, map: Record<string, string[]>): string[] | undefined {
  if (map[property]) return map[property];
  const matches = Object.entries(map).filter(([pattern]) => minimatch(property, pattern));
  return matches.length ? [...new Set(matches.flatMap(([, values]) => values))] : undefined;
}

/**
 * Gets the source path used to evaluate a token's semantic role.
 *
 * @param token The catalogue token to inspect.
 * @returns The source token path for aliases, otherwise the token's own path.
 */
function rolePath(token: CatalogueToken): string {
  return token.sourceToken ?? token.path;
}

/**
 * Checks whether a token path belongs to a configured semantic role.
 *
 * @param tokenPath The dot-separated token path.
 * @param prefix The accepted role prefix.
 * @returns Whether the path equals or descends from the role prefix.
 */
function matchesRolePrefix(tokenPath: string, prefix: string): boolean {
  const basePath = prefix.replace(/\.+$/, "");
  return tokenPath === basePath || tokenPath.startsWith(`${basePath}.`);
}

/**
 * Creates a Stylelint rule that enforces token type and semantic role compatibility.
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
  const typeMap = { ...DEFAULT_TYPES, ...(options.propertyTypes ?? {}) };
  const roleMap = { ...DEFAULT_ROLES, ...(options.semanticRoles ?? {}) };

  root.walkDecls((declaration) => {
    if (declaration.prop.startsWith("--")) return;
    const property = declaration.prop.toLowerCase();
    const expectedTypes = valuesFor(property, typeMap);
    const expectedRoles = valuesFor(property, roleMap);

    for (const variable of customPropertiesInValue(declaration.value)) {
      const token = catalogue.tokensByVariable.get(variable);
      if (!token) continue;
      if (expectedTypes && !expectedTypes.includes(token.type)) {
        report(
          result,
          ruleName,
          declaration,
          `Token "${variable}" has type "${token.type}", which is incompatible with "${property}" (expected ${expectedTypes.join(", ")}).`,
          variable,
        );
        continue;
      }
      if (token.tier === "semantic" && expectedRoles && !expectedRoles.some((prefix) => matchesRolePrefix(rolePath(token), prefix))) {
        report(
          result,
          ruleName,
          declaration,
          `Semantic token "${variable}" has the wrong role for "${property}" (expected ${expectedRoles.join(" or ")}).`,
          variable,
        );
      }
    }
  });
};

rule.ruleName = ruleName;
rule.messages = {};
