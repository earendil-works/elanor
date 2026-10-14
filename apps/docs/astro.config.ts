import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
// oxlint-disable-next-line import/default -- The default export exists under Sentry's Node condition, not its browser entry.
import sentry from '@sentry/astro';
import {defineConfig} from 'astro/config';

import {demos} from './plugins/demos.ts';
import {iconImports} from './plugins/icon-imports.ts';
import {publicAssets} from './plugins/public-assets.ts';

export default defineConfig({
  site: 'https://elanor.earendil.com',
  // Preserve the existing HTML whitespace behavior across the Astro 7 upgrade.
  compressHTML: true,
  integrations: [
    mdx(),
    react(),
    sentry({
      // Astro is static; runtime server errors belong to the Hono Worker.
      enabled: {client: true, server: false},
      org: 'earendil',
      project: 'elanor-docs-frontend',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      telemetry: false,
      sourcemaps: {
        disable: !process.env.SENTRY_AUTH_TOKEN,
        filesToDeleteAfterUpload: ['./dist/**/*.map'],
      },
    }),
    publicAssets(),
  ],
  vite: {
    plugins: [demos(), iconImports()],
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
