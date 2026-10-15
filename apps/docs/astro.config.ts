import {fileURLToPath} from 'node:url';

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import elanorTheme from '@earendil-works/elanor-shiki-theme';
// oxlint-disable-next-line import/default -- The default export exists under Sentry's Node condition, not its browser entry.
import sentry from '@sentry/astro';
import {defineConfig} from 'astro/config';

import {demos} from './plugins/demos.ts';
import {iconImports} from './plugins/icon-imports.ts';
import {publicAssets} from './plugins/public-assets.ts';

// Code blocks in MDX use the token-based theme, like the demo sources.
const markdown = {shikiConfig: {theme: elanorTheme}};

const boiledIcons = fileURLToPath(
  new URL('./node_modules/@earendil-works/elanor-icons-boiled-react/dist', import.meta.url),
);

export default defineConfig({
  site: 'https://elanor.earendil.com',
  markdown,
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
      // The docs show the boiled icons, including inside Elanor's components, which
      // import the plain package. Resolve to the docs' own boiled dependency.
      alias: [
        {find: /^@earendil-works\/elanor-icons-react$/, replacement: `${boiledIcons}/index.js`},
        {find: /^@earendil-works\/elanor-icons-react\/(.+)$/, replacement: `${boiledIcons}/$1.js`},
      ],
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
