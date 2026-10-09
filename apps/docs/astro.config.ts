import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import {defineConfig} from 'astro/config';

import {iconImports} from './plugins/icon-imports.ts';
import {publicAssets} from './plugins/public-assets.ts';

export default defineConfig({
  site: 'https://elanor.earendil.com',
  // Preserve the existing HTML whitespace behavior across the Astro 7 upgrade.
  compressHTML: true,
  integrations: [mdx(), react(), publicAssets()],
  vite: {
    plugins: [iconImports()],
    resolve: {
      conditions:
        process.env.NODE_ENV === 'development'
          ? ['source', 'module', 'browser', 'development']
          : undefined,
    },
    ssr: {
      resolve: {
        conditions:
          process.env.NODE_ENV === 'development'
            ? ['source', 'module', 'node', 'development']
            : undefined,
      },
    },
  },
});
