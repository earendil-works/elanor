import {minimatch} from 'minimatch';
import valueParser, {type Node} from 'postcss-value-parser';
import type {Rule} from 'stylelint';

import type {CatalogueToken} from '../catalogue.js';
import type {RuleOptions} from '../options.js';
import {getCatalogue, isFoundation, isIgnored} from '../options.js';
import {matchesRolePrefix, report, rolePath} from './shared.js';

export const ruleName = 'design-tokens/token-property-compatibility';

const DEFAULT_TYPES: Record<string, string[]> = {
  color: ['color'],
  '*-color': ['color'],
  background: ['color', 'dimension'],
  border: ['color', 'dimension', 'strokeStyle'],
  'border-*': ['color', 'dimension', 'strokeStyle'],
  'border-color': ['color'],
  'border-width': ['dimension'],
  'border-radius': ['dimension'],
  outline: ['color', 'dimension', 'strokeStyle'],
  'outline-*': ['color', 'dimension', 'strokeStyle'],
  'outline-color': ['color'],
  'outline-width': ['dimension'],
  'outline-offset': ['dimension'],
  fill: ['color'],
  stroke: ['color', 'dimension'],
  'margin*': ['dimension'],
  'padding*': ['dimension'],
  gap: ['dimension'],
  'row-gap': ['dimension'],
  'column-gap': ['dimension'],
  'inset*': ['dimension'],
  top: ['dimension'],
  right: ['dimension'],
  bottom: ['dimension'],
  left: ['dimension'],
  width: ['dimension'],
  height: ['dimension'],
  'inline-size': ['dimension'],
  'block-size': ['dimension'],
  'min-*': ['dimension'],
  'max-*': ['dimension'],
  'scroll-margin*': ['dimension'],
  'scroll-padding*': ['dimension'],
  'grid-template*': ['dimension'],
  transform: ['dimension', 'number'],
  translate: ['dimension'],
  scale: ['number'],
  'transform-origin': ['dimension'],
  'flex-basis': ['dimension'],
  'z-index': ['number'],
  'aspect-ratio': ['number'],
  'font-family': ['fontFamily'],
  'font-size': ['dimension'],
  'font-weight': ['fontWeight'],
  'line-height': ['number', 'dimension'],
  'letter-spacing': ['dimension'],
  font: ['typography', 'fontFamily', 'fontWeight', 'dimension', 'number'],
  opacity: ['number'],
  'box-shadow': ['shadow', 'color', 'dimension'],
  'text-shadow': ['shadow', 'color', 'dimension'],
  transition: ['transition', 'duration', 'cubicBezier'],
  animation: ['transition', 'duration', 'cubicBezier'],
  'transition-duration': ['duration'],
  'transition-delay': ['duration'],
  'animation-duration': ['duration'],
  'animation-delay': ['duration'],
  'transition-timing-function': ['cubicBezier'],
  'animation-timing-function': ['cubicBezier'],
};

const DEFAULT_ROLES: Record<string, string[]> = {
  // CSS properties are paint mechanisms, not a one-to-one semantic taxonomy:
  // icons inherit currentColor, separators paint borders with backgrounds, and
  // filled controls can extend their fill or focus treatment through a border.
  color: ['semantic.color.text.', 'semantic.color.icon.'],
  background: ['semantic.color.background.', 'semantic.color.border.'],
  'background-color': ['semantic.color.background.', 'semantic.color.border.'],
  border: [
    'semantic.color.border.',
    'semantic.color.background.',
    'semantic.color.focusRing.',
    'semantic.dimension.borderWidth.',
  ],
  'border-*': [
    'semantic.color.border.',
    'semantic.color.background.',
    'semantic.color.focusRing.',
    'semantic.dimension.borderWidth.',
    'semantic.dimension.radius.',
  ],
  'border-color': [
    'semantic.color.border.',
    'semantic.color.background.',
    'semantic.color.focusRing.',
  ],
  'border-width': ['semantic.dimension.borderWidth.'],
  'border-radius': ['semantic.dimension.radius.'],
  outline: ['semantic.color.focusRing.', 'semantic.dimension.borderWidth.'],
  'outline-*': ['semantic.color.focusRing.', 'semantic.dimension.borderWidth.'],
  'outline-color': ['semantic.color.focusRing.'],
  'outline-width': ['semantic.dimension.borderWidth.'],
  fill: ['semantic.color.icon.'],
  stroke: ['semantic.color.icon.'],
  'box-shadow': [
    'semantic.shadow.',
    'semantic.dimension.borderWidth.',
    'semantic.color.border.',
    'semantic.color.background.',
    'semantic.color.focusRing.',
  ],
  width: ['semantic.dimension.size.', 'semantic.dimension.borderWidth.'],
  height: ['semantic.dimension.size.', 'semantic.dimension.borderWidth.'],
  'inline-size': ['semantic.dimension.size.', 'semantic.dimension.borderWidth.'],
  'block-size': ['semantic.dimension.size.', 'semantic.dimension.borderWidth.'],
  'min-*': ['semantic.dimension.size.', 'semantic.dimension.borderWidth.'],
  'max-*': ['semantic.dimension.size.', 'semantic.dimension.borderWidth.'],
  'z-index': ['semantic.number.layer.'],
  opacity: ['semantic.number.opacity.'],
  scale: ['semantic.number.scale.'],
  translate: ['semantic.dimension.travel.'],
  transition: ['semantic.transition.'],
  animation: ['semantic.transition.'],
  'transition-duration': ['semantic.transition.'],
  'transition-delay': ['semantic.transition.'],
  'transition-timing-function': ['semantic.transition.'],
  'animation-duration': ['semantic.transition.'],
  'animation-delay': ['semantic.transition.'],
  'animation-timing-function': ['semantic.transition.'],
  'margin*': ['semantic.dimension.space.', 'semantic.dimension.size.'],
  'padding*': ['semantic.dimension.space.padding.', 'semantic.dimension.space.control.padding.'],
  gap: ['semantic.dimension.space.gap.', 'semantic.dimension.space.control.gap.'],
  'row-gap': ['semantic.dimension.space.gap.', 'semantic.dimension.space.control.gap.'],
  'column-gap': ['semantic.dimension.space.gap.', 'semantic.dimension.space.control.gap.'],
};

/** Sizes, which may also use spacing tokens inside `calc()` to adjust another value. */
const SIZE_PROPERTY = /^(?:(?:min|max)-)?(?:width|height|inline-size|block-size)$/;
const SIZE_CALC_ROLES = ['semantic.dimension.space.'];

/**
 * Roles for tokens of one type inside transform functions: distances in a
 * translation are travel, factors in a scaling are scale. Other tokens in the
 * same function, such as a number multiplying a distance, keep the property's
 * roles.
 */
const TRANSFORM_FUNCTION_ROLES: Record<string, {type: string; roles: string[]}> = {
  translate: {type: 'dimension', roles: ['semantic.dimension.travel.']},
  translatex: {type: 'dimension', roles: ['semantic.dimension.travel.']},
  translatey: {type: 'dimension', roles: ['semantic.dimension.travel.']},
  translatez: {type: 'dimension', roles: ['semantic.dimension.travel.']},
  translate3d: {type: 'dimension', roles: ['semantic.dimension.travel.']},
  scale: {type: 'number', roles: ['semantic.number.scale.']},
  scalex: {type: 'number', roles: ['semantic.number.scale.']},
  scaley: {type: 'number', roles: ['semantic.number.scale.']},
  scalez: {type: 'number', roles: ['semantic.number.scale.']},
  scale3d: {type: 'number', roles: ['semantic.number.scale.']},
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

function significantNodes(nodes: Node[]): Node[] {
  return nodes.filter((node) => node.type !== 'space' && node.type !== 'comment');
}

/** Resolves a bare var() operand; fallbacks remain subject to normal validation. */
function operandToken(
  node: Node,
  tokens: ReadonlyMap<string, CatalogueToken>,
): CatalogueToken | undefined {
  if (node.type !== 'function' || node.value.toLowerCase() !== 'var') return;
  const args = significantNodes(node.nodes);
  if (args.length !== 1 || args[0]?.type !== 'word') return;
  return tokens.get(args[0].value);
}

/** Recognizes only top-level calc(padding token - border-width token) values. */
function compensatedBorderOperands(
  nodes: Node[],
  tokens: ReadonlyMap<string, CatalogueToken>,
): Set<Node> {
  const operands = new Set<Node>();
  for (const node of nodes) {
    if (node.type !== 'function' || node.value.toLowerCase() !== 'calc') continue;
    const expression = significantNodes(node.nodes);
    const [left, operator, right] = expression;
    if (
      expression.length !== 3 ||
      !left ||
      !right ||
      operator?.type !== 'word' ||
      operator.value !== '-'
    )
      continue;
    const padding = operandToken(left, tokens);
    const border = operandToken(right, tokens);
    if (
      padding?.tier !== 'semantic' ||
      padding.type !== 'dimension' ||
      border?.tier !== 'semantic' ||
      border.type !== 'dimension'
    )
      continue;
    if (
      DEFAULT_ROLES['padding*']!.some((prefix) => matchesRolePrefix(rolePath(padding), prefix)) &&
      matchesRolePrefix(rolePath(border), 'semantic.dimension.borderWidth.')
    ) {
      // Track the operand occurrence, not its name: other uses must still be checked.
      operands.add(right);
    }
  }
  return operands;
}

/** Where a value node sits: its nearest transform function with roles, and whether it is inside `calc()`. */
interface NodeContext {
  transformFunction: string | undefined;
  inCalc: boolean;
}

/**
 * Walks value nodes, passing each node its context.
 *
 * @param nodes The nodes to walk.
 * @param context The context of the nodes.
 * @param visit The callback for each node.
 */
function walkWithContext(
  nodes: Node[],
  context: NodeContext,
  visit: (node: Node, context: NodeContext) => void,
): void {
  for (const node of nodes) {
    visit(node, context);
    if (node.type !== 'function') continue;
    const name = node.value.toLowerCase();
    walkWithContext(
      node.nodes,
      {
        transformFunction: name in TRANSFORM_FUNCTION_ROLES ? name : context.transformFunction,
        inCalc: context.inCalc || name === 'calc',
      },
      visit,
    );
  }
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
  const typeMap = {...DEFAULT_TYPES, ...(options.propertyTypes ?? {})};
  const roleMap = {...DEFAULT_ROLES, ...(options.semanticRoles ?? {})};
  // A configured `transform` role replaces the defaults, including the roles
  // inside translate and scale functions.
  const transformFunctionRoles =
    valuesFor('transform', options.semanticRoles ?? {}) === undefined
      ? TRANSFORM_FUNCTION_ROLES
      : {};

  root.walkDecls((declaration) => {
    if (declaration.prop.startsWith('--')) return;
    const property = declaration.prop.toLowerCase();
    const expectedTypes = valuesFor(property, typeMap);
    const propertyRoles = valuesFor(property, roleMap);
    // A configured role for this size replaces the defaults, including the calc() exception.
    const sizeCalcApplies =
      SIZE_PROPERTY.test(property) &&
      valuesFor(property, options.semanticRoles ?? {}) === undefined;
    const parsed = valueParser(declaration.value);
    const compensatedBorders =
      /^padding(?:-(?:top|right|bottom|left|(?:block|inline)(?:-start|-end)?))?$/.test(property)
        ? compensatedBorderOperands(parsed.nodes, catalogue.tokensByVariable)
        : new Set<Node>();

    walkWithContext(
      parsed.nodes,
      {transformFunction: undefined, inCalc: false},
      (node, {transformFunction, inCalc}) => {
        if (node.type !== 'function' || node.value.toLowerCase() !== 'var') return;
        const variable = node.nodes.find(
          (child) => child.type === 'word' && child.value.startsWith('--'),
        )?.value;
        if (!variable) return;
        const token = catalogue.tokensByVariable.get(variable);
        if (!token) return;
        const functionRoles =
          property === 'transform' && transformFunction
            ? transformFunctionRoles[transformFunction]
            : undefined;
        // Spacing may adjust a size inside calc(), such as subtracting an inset.
        const sizeRoles =
          propertyRoles && inCalc && sizeCalcApplies
            ? [...propertyRoles, ...SIZE_CALC_ROLES]
            : propertyRoles;
        const expectedRoles =
          functionRoles && functionRoles.type === token.type ? functionRoles.roles : sizeRoles;
        if (expectedTypes && !expectedTypes.includes(token.type)) {
          report(
            result,
            ruleName,
            declaration,
            `Token "${variable}" has type "${token.type}", which is incompatible with "${property}" (expected ${expectedTypes.join(', ')}).`,
            variable,
          );
          return;
        }
        if (
          token.tier === 'semantic' &&
          expectedRoles &&
          !compensatedBorders.has(node) &&
          !expectedRoles.some((prefix) => matchesRolePrefix(rolePath(token), prefix))
        ) {
          report(
            result,
            ruleName,
            declaration,
            `Semantic token "${variable}" has the wrong role for "${property}" (expected ${expectedRoles.join(' or ')}).`,
            variable,
          );
        }
      },
    );
  });
};

rule.ruleName = ruleName;
rule.messages = {};
