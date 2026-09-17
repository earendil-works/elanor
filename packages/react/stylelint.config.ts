import {fileURLToPath} from 'node:url';
import {createStrictConfig} from '@earendil-works/stylelint-plugin-design-tokens';

export default createStrictConfig({
  catalogue: fileURLToPath(new URL('../design-tokens/dist/radius/tokens.catalog.json', import.meta.url)),
  // Base UI supplies these values at runtime for popup and indicator geometry.
  allowCustomProperties: [
    '--anchor-width',
    '--available-width',
    '--available-height',
    '--active-tab-left',
    '--active-tab-top',
    '--active-tab-width',
    '--active-tab-height',
  ],
});
