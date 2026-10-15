/**
 * A Shiki theme whose colors are the `semantic.color.text.code` tokens on
 * `semantic.color.background.fill.secondary`, as CSS variables, so one theme
 * covers light and dark and every brand.
 */
export default {
  name: 'elanor',
  type: 'light',
  fg: 'var(--semantic-color-text-code)',
  bg: 'var(--semantic-color-background-fill-secondary)',
  tokenColors: [
    {
      settings: {
        foreground: 'var(--semantic-color-text-code)',
      },
    },
    {
      scope: ['comment', 'punctuation.definition.comment', 'string.comment'],
      settings: {
        foreground: 'var(--semantic-color-text-code-comment)',
      },
    },
    {
      scope: [
        'punctuation',
        'keyword.operator',
        'meta.brace',
        'punctuation.definition.tag',
        'punctuation.separator',
      ],
      settings: {
        foreground: 'var(--semantic-color-text-code-punctuation)',
      },
    },
    {
      scope: [
        'keyword',
        'storage',
        'storage.type',
        'storage.modifier',
        'variable.language',
        'entity.name.tag',
      ],
      settings: {
        foreground: 'var(--semantic-color-text-code-keyword)',
      },
    },
    {
      scope: ['entity.name.function', 'support.function', 'meta.function-call.generic'],
      settings: {
        foreground: 'var(--semantic-color-text-code-function)',
      },
    },
    {
      scope: [
        'variable',
        'variable.parameter',
        'variable.other',
        'meta.object-literal.key',
        'entity.other.attribute-name',
        'support.type.property-name',
        'entity.name.tag.yaml',
      ],
      settings: {
        foreground: 'var(--semantic-color-text-code-variable)',
      },
    },
    {
      scope: [
        'string',
        'string.regexp',
        'punctuation.definition.string',
        'punctuation.definition.template-expression',
      ],
      settings: {
        foreground: 'var(--semantic-color-text-code-string)',
      },
    },
    {
      scope: ['constant.numeric', 'constant.language', 'constant.character.escape'],
      settings: {
        foreground: 'var(--semantic-color-text-code-number)',
      },
    },
    {
      scope: [
        'entity.name.type',
        'entity.name.class',
        'entity.name.namespace',
        'entity.other.inherited-class',
        'support.type',
        'support.class',
      ],
      settings: {
        foreground: 'var(--semantic-color-text-code-type)',
      },
    },
  ],
};
