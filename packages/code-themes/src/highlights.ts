import type {Theme} from '@pierre/highlights';

/**
 * A Highlights theme whose colors are the `semantic.color.text.code` tokens, like the Shiki
 * theme. Highlights accepts only literal colors in a theme, so this one is a palette: each syntax
 * scope names the token it uses, and the highlighter writes `var(--semantic-color-text-code-…)`.
 * Unlisted scopes inherit from their parent scope, then use the plain code color.
 */
export default {
  name: 'elanor',
  appearance: 'light',
  cssVariables: {
    prefix: '--semantic-color-text-code-',
    defaults: {foreground: 'var(--semantic-color-text-code)'},
  },
  style: {
    syntax: {
      comment: 'comment',
      punctuation: 'punctuation',
      operator: 'punctuation',
      keyword: 'keyword',
      tag: 'keyword',
      'variable.special': 'keyword',
      function: 'function',
      variable: 'variable',
      property: 'variable',
      attribute: 'variable',
      string: 'string',
      'string.escape': 'number',
      number: 'number',
      boolean: 'number',
      constant: 'number',
      type: 'type',
      constructor: 'type',
      namespace: 'type',
    },
  },
} satisfies Theme;
