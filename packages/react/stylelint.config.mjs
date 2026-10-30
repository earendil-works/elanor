import {fileURLToPath} from 'node:url';

import {createStrictConfig} from '@earendil-works/stylelint-plugin-design-tokens';

export default createStrictConfig({
  catalogue: fileURLToPath(
    new URL('../design-tokens/dist/radius/tokens.catalog.json', import.meta.url),
  ),
  // Base UI supplies these values at runtime for popup and indicator geometry.
  allowCustomProperties: [
    '--anchor-width',
    '--available-width',
    '--available-height',
    '--active-tab-left',
    '--active-tab-top',
    '--active-tab-width',
    '--active-tab-height',
    '--transform-origin',
    '--collapsible-panel-height',
    '--positioner-width',
    '--positioner-height',
    '--popup-width',
    '--popup-height',
    '--drawer-snap-point-offset',
    '--drawer-swipe-movement-x',
    '--drawer-swipe-movement-y',
    '--drawer-swipe-progress',
    '--drawer-swipe-strength',
    '--drawer-height',
    '--drawer-frontmost-height',
    '--nested-drawers',
    // TableOfContents.Indicator measures the active entry, like Base UI's Tabs indicator.
    '--active-entry-top',
    '--active-entry-height',
    // TableOfContents.Menu sets how far content has scrolled beneath its sticky bar (0 to 1).
    '--sticky-progress',
    // FileTree.Item sets its depth; FileTree.Root exposes the indentation guide image for overriding.
    '--file-tree-level',
    '--file-tree-guide',
  ],
});
