import {defineConfig} from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import {iconImports} from './plugins/icon-imports.ts';

export default defineConfig({
  integrations: [mdx(), react()],
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
