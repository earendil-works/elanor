import valueParser, {type Node} from 'postcss-value-parser';

const COLOR_FUNCTIONS = new Set([
  'rgb',
  'rgba',
  'hsl',
  'hsla',
  'hwb',
  'lab',
  'lch',
  'oklab',
  'oklch',
  'color',
  'color-mix',
]);
const NAMED_COLORS = new Set([
  'black',
  'white',
  'red',
  'green',
  'blue',
  'yellow',
  'purple',
  'gray',
  'grey',
  'orange',
  'pink',
]);
const DIMENSION = /^[-+]?(?:\d*\.)?\d+(px|rem)$/i;
const TIME = /^[-+]?(?:\d*\.)?\d+m?s$/i;
const EASING_KEYWORDS = /^(?:ease|ease-in|ease-out|ease-in-out|linear)$/i;
const EASING_FUNCTIONS = new Set(['cubic-bezier', 'linear']);
const NUMBER = /^[-+]?(?:\d*\.)?\d+$/;
const FONT_WEIGHT_KEYWORDS = /^(?:normal|bold|bolder|lighter)$/;
const GENERIC_FONT_FAMILIES =
  /^(?:serif|sans-serif|monospace|system-ui|inherit|initial|unset|revert)$/;
const FONT_STYLE_KEYWORDS = /^(?:normal|italic|oblique)$/;
const FONT_VARIANT_KEYWORDS = /^(?:normal|small-caps)$/;
const FONT_STRETCH_KEYWORDS =
  /^(?:normal|ultra-condensed|extra-condensed|condensed|semi-condensed|semi-expanded|expanded|extra-expanded|ultra-expanded)$/;

export interface LiteralPolicy {
  allowUnitlessZero: boolean;
}

export interface LiteralValue {
  value: string;
  category:
    | 'color'
    | 'cubicBezier'
    | 'dimension'
    | 'duration'
    | 'fontFamily'
    | 'fontWeight'
    | 'number';
}

/**
 * Extracts custom property references from CSS `var()` functions.
 *
 * @param value The CSS value to parse.
 * @returns The referenced custom property names in source order.
 */
export function customPropertiesInValue(value: string): string[] {
  const properties: string[] = [];
  valueParser(value).walk((node) => {
    if (node.type !== 'function' || node.value.toLowerCase() !== 'var') return;
    const property = node.nodes.find(
      (child) => child.type === 'word' && child.value.startsWith('--'),
    );
    if (property) properties.push(property.value);
  });
  return properties;
}

/**
 * Checks whether a CSS property can contain a tokenizable color value.
 *
 * @param property The normalized CSS property name.
 * @returns Whether color literals should be inspected for the property.
 */
function isColorProperty(property: string): boolean {
  return (
    property === 'color' ||
    property === 'background' ||
    property === 'background-color' ||
    property === 'fill' ||
    property === 'stroke' ||
    property === 'box-shadow' ||
    property === 'text-shadow' ||
    /(?:^|-)color$/.test(property) ||
    /^(?:border|outline)(?:-|$)/.test(property)
  );
}

/**
 * Checks whether a CSS property can contain a tokenizable dimension value.
 *
 * @param property The normalized CSS property name.
 * @returns Whether dimension literals should be inspected for the property.
 */
function isDimensionProperty(property: string): boolean {
  return (
    /^(?:margin|padding|gap|row-gap|column-gap|inset|top|right|bottom|left|width|height|min-width|max-width|min-height|max-height|border-radius|border-width|outline-width|outline-offset|scroll-margin|scroll-padding|grid-template|transform|translate|flex-basis|font-size|letter-spacing|box-shadow|text-shadow)(?:-|$)/.test(
      property,
    ) ||
    /^(?:min-|max-)?(?:inline-size|block-size)$/.test(property) ||
    /^(?:background|border|outline|font)$/.test(property)
  );
}

/**
 * Checks whether a CSS property can contain a tokenizable unitless number.
 *
 * @param property The normalized CSS property name.
 * @returns Whether number literals should be inspected for the property.
 */
function isNumberProperty(property: string): boolean {
  return /^(?:opacity|line-height|transform|scale|z-index|aspect-ratio)$/.test(property);
}

/**
 * Checks whether a zero is a design value rather than structural absence: the
 * transparent end of a fade, or a scale that shrinks to nothing.
 *
 * @param property The normalized CSS property name.
 * @returns Whether unitless zero should be inspected for the property.
 */
function isZeroTokenized(property: string): boolean {
  return property === 'opacity' || property === 'scale';
}

/**
 * Checks whether a CSS property can contain a tokenizable duration.
 *
 * @param property The normalized CSS property name.
 * @returns Whether time literals should be inspected for the property.
 */
function isDurationProperty(property: string): boolean {
  return /^(?:transition|animation)(?:-(?:duration|delay))?$/.test(property);
}

/**
 * Checks whether a CSS property can contain a tokenizable easing curve.
 *
 * @param property The normalized CSS property name.
 * @returns Whether easing keywords and functions should be inspected for the property.
 */
function isEasingProperty(property: string): boolean {
  return /^(?:transition|animation)(?:-timing-function)?$/.test(property);
}

/**
 * Classifies a parsed value node when it is tokenizable for a CSS property.
 *
 * @param node The parsed value node.
 * @param property The normalized CSS property name.
 * @param policy The configured literal exceptions.
 * @returns The classified literal, or `undefined` when the node is not tokenizable.
 */
function literalFromNode(
  node: Node,
  property: string,
  policy: LiteralPolicy,
): LiteralValue | undefined {
  if (
    node.type === 'function' &&
    COLOR_FUNCTIONS.has(node.value.toLowerCase()) &&
    isColorProperty(property)
  ) {
    return {value: valueParser.stringify(node), category: 'color'};
  }
  if (
    node.type === 'function' &&
    EASING_FUNCTIONS.has(node.value.toLowerCase()) &&
    isEasingProperty(property)
  ) {
    return {value: valueParser.stringify(node), category: 'cubicBezier'};
  }
  if (node.type === 'string' && property === 'font-family') {
    return {value: node.value, category: 'fontFamily'};
  }
  if (node.type !== 'word') return undefined;

  const word = node.value;
  if (
    isColorProperty(property) &&
    (/^#[\da-f]{3,8}$/i.test(word) || NAMED_COLORS.has(word.toLowerCase()))
  ) {
    return {value: word, category: 'color'};
  }
  if (isDurationProperty(property) && TIME.test(word)) {
    return {value: word, category: 'duration'};
  }
  if (isEasingProperty(property) && EASING_KEYWORDS.test(word)) {
    return {value: word, category: 'cubicBezier'};
  }
  if (isDimensionProperty(property) && DIMENSION.test(word)) {
    return {value: word, category: 'dimension'};
  }
  if (property === 'font-weight' && (NUMBER.test(word) || FONT_WEIGHT_KEYWORDS.test(word))) {
    return {value: word, category: 'fontWeight'};
  }
  if (isNumberProperty(property) && NUMBER.test(word)) {
    if (policy.allowUnitlessZero && Number(word) === 0 && !isZeroTokenized(property))
      return undefined;
    return {value: word, category: 'number'};
  }
  if (property === 'font-family' && !GENERIC_FONT_FAMILIES.test(word)) {
    return {value: word, category: 'fontFamily'};
  }
  return undefined;
}

function tokenizableFontShorthandLiterals(value: string, policy: LiteralPolicy): LiteralValue[] {
  const literals: LiteralValue[] = [];
  const seen = new Set<string>();
  let sawFontSize = false;
  let expectLineHeight = false;

  const push = (literal: LiteralValue | undefined): void => {
    if (!literal) return;
    const key = `${literal.category}:${literal.value}`;
    if (seen.has(key)) return;
    seen.add(key);
    literals.push(literal);
  };

  for (const node of valueParser(value).nodes) {
    if (node.type === 'space' || node.type === 'comment') continue;
    if (node.type === 'div') {
      if (node.value === '/' && sawFontSize) expectLineHeight = true;
      continue;
    }
    if (!sawFontSize) {
      if (node.type === 'string') continue;
      if (node.type !== 'word') continue;
      const word = node.value;
      if (DIMENSION.test(word)) {
        sawFontSize = true;
        push({value: word, category: 'dimension'});
        continue;
      }
      if (NUMBER.test(word) || FONT_WEIGHT_KEYWORDS.test(word)) {
        push({value: word, category: 'fontWeight'});
        continue;
      }
      if (
        FONT_STYLE_KEYWORDS.test(word) ||
        FONT_VARIANT_KEYWORDS.test(word) ||
        FONT_STRETCH_KEYWORDS.test(word)
      ) {
        continue;
      }
      continue;
    }

    if (expectLineHeight) {
      expectLineHeight = false;
      if (node.type === 'word') {
        if (DIMENSION.test(node.value)) push({value: node.value, category: 'dimension'});
        else if (NUMBER.test(node.value) && !(policy.allowUnitlessZero && Number(node.value) === 0))
          push({value: node.value, category: 'number'});
      }
      continue;
    }

    if (node.type === 'string') {
      push({value: node.value, category: 'fontFamily'});
      continue;
    }
    if (node.type === 'word' && !GENERIC_FONT_FAMILIES.test(node.value)) {
      push({value: node.value, category: 'fontFamily'});
    }
  }

  return literals;
}

/**
 * Finds unique literal values that should be represented by design tokens.
 *
 * @param property The CSS property containing the value.
 * @param value The CSS value to parse.
 * @param policy The configured literal exceptions.
 * @returns The tokenizable literals in source order.
 */
export function tokenizableLiterals(
  property: string,
  value: string,
  policy: LiteralPolicy = {allowUnitlessZero: true},
): LiteralValue[] {
  if (property.toLowerCase() === 'font') return tokenizableFontShorthandLiterals(value, policy);

  const literals: LiteralValue[] = [];
  const seen = new Set<string>();
  const parsed = valueParser(value);
  const arithmeticScalars = new Set<Node>();
  parsed.walk((node) => {
    if (node.type !== 'function' || node.value.toLowerCase() !== 'calc') return;
    if (customPropertiesInValue(valueParser.stringify(node)).length === 0) return;
    const operands = node.nodes.filter(
      (child) => child.type !== 'space' && child.type !== 'comment',
    );
    for (const [index, operand] of operands.entries()) {
      if (operand.type !== 'word' || !NUMBER.test(operand.value)) continue;
      const before = operands[index - 1]?.value;
      const after = operands[index + 1]?.value;
      // Signs and ratios derive geometry from a token; they are not additional
      // brand values. Literal dimensions and var() fallbacks are still checked.
      if (before === '*' || before === '/' || after === '*') arithmeticScalars.add(operand);
    }
  });
  parsed.walk((node) => {
    // URLs are resources, not design values. Color functions are reported as a
    // whole, so their numeric channels are not independently inspected.
    if (node.type === 'function' && node.value.toLowerCase() === 'url') return false;
    if (arithmeticScalars.has(node)) return undefined;
    const literal = literalFromNode(node, property.toLowerCase(), policy);
    if (!literal) return undefined;
    const key = `${literal.category}:${literal.value}`;
    if (!seen.has(key)) {
      seen.add(key);
      literals.push(literal);
    }
    if (
      node.type === 'function' &&
      (COLOR_FUNCTIONS.has(node.value.toLowerCase()) ||
        (EASING_FUNCTIONS.has(node.value.toLowerCase()) &&
          isEasingProperty(property.toLowerCase())))
    )
      return false;
    return undefined;
  });
  return literals;
}
