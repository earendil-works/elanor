import {defineConfig} from 'astro/config';
import {fileURLToPath} from 'node:url';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import {iconImports} from './plugins/icon-imports.ts';

export default defineConfig({
  integrations: [mdx(), react()],
  vite: {
    plugins: [iconImports()],
    resolve: {
      // Co-located MDX is docs-only content; appearance adapters belong to the consumer app.
      alias: {'@elanor-docs': fileURLToPath(new URL('./src/components', import.meta.url))},
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
