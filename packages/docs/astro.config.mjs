import {defineConfig} from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import {fileURLToPath} from 'node:url';

export default defineConfig({
  integrations: [mdx(), react()],
  vite: {
    resolve: {
      alias: {
        '@earendil-works/elanor-react': fileURLToPath(
          new URL('../react/src/index.ts', import.meta.url),
        ),
      },
    },
  },
});
