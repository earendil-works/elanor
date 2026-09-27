import {fileURLToPath} from 'node:url';
import {createStrictConfig} from '@earendil-works/stylelint-plugin-design-tokens';

const strictConfig = createStrictConfig({
  catalogue: fileURLToPath(
    new URL('../../packages/design-tokens/dist/radius/tokens.catalog.json', import.meta.url),
  ),
  // Font-face descriptors define the font assets that the typography tokens consume.
  ignoreFiles: ['**/fonts.css'],
  // Public properties of @earendil-works/elanor-strokes.
  allowCustomProperties: ['--stroke-*'],
});

export default {
  ...strictConfig,
  overrides: [
    {
      files: ['**/*.astro'],
      customSyntax: 'postcss-html',
    },
  ],
};
