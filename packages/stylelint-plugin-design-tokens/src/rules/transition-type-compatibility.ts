import type {Container, Declaration} from 'postcss';
import valueParser, {type Node} from 'postcss-value-parser';
import type {Rule} from 'stylelint';

import type {LoadedCatalogue} from '../catalogue.js';
import type {RuleOptions} from '../options.js';
import {getCatalogue, isFoundation, isIgnored} from '../options.js';
import {matchesRolePrefix, report, rolePath} from './shared.js';

export const ruleName = 'design-tokens/transition-type-compatibility';

const TRANSITION_ROLE = 'semantic.transition.';

/**
 * The transition type each transitioned property needs. Movement becomes
 * instant when the reader prefers reduced motion, so anything that moves must
 * use it. Properties that only switch at the end of another transition accept
 * any transition; other properties are not checked.
 */
const PROPERTY_ROLES: Array<{pattern: RegExp; role: string}> = [
  {
    pattern:
      /^(?:transform|translate|scale|rotate|inset(?:-.+)?|top|right|bottom|left|(?:min-|max-)?(?:width|height|inline-size|block-size)|grid-template-.+)$/,
    role: 'semantic.transition.movement.',
  },
  {pattern: /^opacity$/, role: 'semantic.transition.fade'},
  {
    pattern:
      /^(?:color|background|background-color|border(?:-[a-z]+)*-color|outline-color|box-shadow|text-decoration-color|fill|stroke)$/,
    role: 'semantic.transition.feedback',
  },
  {pattern: /^(?:visibility|display|overlay|content-visibility)$/, role: TRANSITION_ROLE},
];

const NON_PROPERTY_WORDS =
  /^(?:none|all|ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end|normal|allow-discrete|inherit|initial|unset|revert|revert-layer)$/i;
const TIME = /^[-+]?(?:\d*\.)?\d+m?s$/i;

/**
 * Splits a comma-separated value into its top-level items.
 *
 * @param value The CSS value.
 * @returns The nodes of each item.
 */
function items(value: string): Node[][] {
  const result: Node[][] = [[]];
  for (const node of valueParser(value).nodes) {
    if (node.type === 'div' && node.value === ',') result.push([]);
    else if (node.type !== 'space' && node.type !== 'comment') result.at(-1)!.push(node);
  }
  return result;
}

/**
 * Finds the transitioned property of a `transition` shorthand item.
 *
 * @param nodes The item's nodes.
 * @returns The property, `all` when the item names none, or `none`.
 */
function shorthandProperty(nodes: Node[]): string {
  const word = nodes.find(
    (node) =>
      node.type === 'word' &&
      !node.value.startsWith('--') &&
      !TIME.test(node.value) &&
      !NON_PROPERTY_WORDS.test(node.value),
  );
  if (word) return word.value.toLowerCase();
  return nodes.some((node) => node.type === 'word' && node.value.toLowerCase() === 'none')
    ? 'none'
    : 'all';
}

/** Lists the transition tokens referenced anywhere in some nodes. */
function transitionTokens(nodes: Node[], catalogue: LoadedCatalogue) {
  const found: Array<{variable: string; path: string}> = [];
  valueParser.walk(nodes, (node) => {
    if (node.type !== 'function' || node.value.toLowerCase() !== 'var') return;
    const variable = node.nodes.find(
      (child) => child.type === 'word' && child.value.startsWith('--'),
    )?.value;
    const token = variable ? catalogue.tokensByVariable.get(variable) : undefined;
    if (variable && token && matchesRolePrefix(rolePath(token), TRANSITION_ROLE))
      found.push({variable, path: rolePath(token)});
  });
  return found;
}

/**
 * Creates a Stylelint rule that matches each transitioned property to the
 * transition type it needs: movement for anything that moves, fade for
 * opacity, and feedback for color changes.
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

  const check = (declaration: Declaration, property: string, timing: Node[]): void => {
    if (property === 'none') return;
    if (property === 'all') {
      report(
        result,
        ruleName,
        declaration,
        'Do not transition "all"; list each transitioned property with its transition token.',
      );
      return;
    }
    const expected = PROPERTY_ROLES.find(({pattern}) => pattern.test(property))?.role;
    if (!expected) return;
    for (const {variable, path} of transitionTokens(timing, catalogue)) {
      if (matchesRolePrefix(path, expected)) continue;
      report(
        result,
        ruleName,
        declaration,
        `Transitioning "${property}" needs a ${expected.replace(/\.$/, '.*')} token; "${variable}" is ${path}.`,
        variable,
      );
    }
  };

  root.walkDecls(/^transition$/i, (declaration) => {
    for (const item of items(declaration.value)) check(declaration, shorthandProperty(item), item);
  });

  // Longhands pair properties with durations, delays, and easings by position,
  // repeating the shorter lists as CSS does.
  root.walk((node) => {
    if (!('nodes' in node) || !node.nodes) return;
    const declarations = new Map<string, Declaration>();
    for (const child of (node as Container).nodes ?? []) {
      if (child.type === 'decl' && /^transition-/i.test(child.prop))
        declarations.set(child.prop.toLowerCase(), child);
    }
    const propertyDeclaration = declarations.get('transition-property');
    if (!propertyDeclaration) return;
    const properties = items(propertyDeclaration.value).map(shorthandProperty);
    const timings = ['transition-duration', 'transition-delay', 'transition-timing-function']
      .map((name) => declarations.get(name))
      .filter((declaration): declaration is Declaration => declaration !== undefined)
      .map((declaration) => ({declaration, values: items(declaration.value)}));
    properties.forEach((property, index) => {
      if (property === 'all') {
        check(propertyDeclaration, property, []);
        return;
      }
      for (const {declaration, values} of timings)
        check(declaration, property, values[index % values.length] ?? []);
    });
  });
};

rule.ruleName = ruleName;
rule.messages = {};
