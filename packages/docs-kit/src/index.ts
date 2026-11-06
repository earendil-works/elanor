import {createReadStream, existsSync, readFileSync, statSync} from 'node:fs';
import {cp} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {dirname, extname, join, relative, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

import react from '@astrojs/react';
import type {AstroIntegration} from 'astro';

import {
  componentSlots,
  resolveConfig,
  type DocsKitOptions,
  type ResolvedDocsConfig,
} from './config.ts';
import {pageScripts} from './page-scripts.ts';

export {brands, componentSlots, resolveConfig} from './config.ts';
export type {Brand, ComponentSlot, DocsKitOptions, DocsLink, ResolvedDocsConfig} from './config.ts';

/*
 * The docs kit as an Astro integration, in the manner of Starlight: it adds the routes, the
 * stylesheets, and the page scripts to an Astro project. The `elanor-docs` command runs it on a
 * project of its own, so a folder of Markdown needs no Astro project; a project that wants one adds
 * `elanorDocs()` to its `astro.config.ts` instead.
 */

const runtime = fileURLToPath(new URL('../runtime/', import.meta.url));
const require = createRequire(import.meta.url);

const virtualIds = {
  config: 'virtual:elanor-docs/config',
  styles: 'virtual:elanor-docs/styles',
  components: 'virtual:elanor-docs/components',
} as const;

/** The files of the Markdown folder the site publishes as they are, by extension. */
const contentTypes: Record<string, string> = {
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

/**
 * Whether the site publishes a file of the Markdown folder as it is: the Markdown, for agents and
 * "Copy page", and images, videos, and PDFs. Code and configuration stay out, as the Markdown folder
 * may be the whole project.
 */
export function isPublishedFile(relativePath: string): boolean {
  const parts = relativePath.split(/[\\/]/);
  if (parts.some((part) => part.startsWith('.') || part === 'node_modules')) return false;
  // The navigation, and instructions for the repository's agents.
  if (['SUMMARY.md', 'AGENTS.md', 'CLAUDE.md'].includes(relativePath)) return false;
  return extname(relativePath).toLowerCase() in contentTypes;
}

/** The brand's canvas color in light and dark, for the browser's theme color. */
function themeColor(brand: string): {light: string; dark: string} | undefined {
  try {
    const catalog = JSON.parse(
      readFileSync(require.resolve(`@earendil-works/design-tokens/${brand}.catalog.json`), 'utf8'),
    ) as {
      tokens: {
        path: string;
        value?: {hex?: string};
        contexts?: {colorScheme?: {dark?: {value?: {hex?: string}}}};
      }[];
    };
    const canvas = catalog.tokens.find(
      (token) => token.path === 'semantic.color.background.canvas',
    );
    const light = canvas?.value?.hex;
    const dark = canvas?.contexts?.colorScheme?.dark?.value?.hex ?? light;
    return light && dark ? {light, dark} : undefined;
  } catch {
    return undefined;
  }
}

export interface ElanorDocsOptions extends DocsKitOptions {
  /** Already resolved by the `elanor-docs` command; skips resolving the options again. */
  readonly resolved?: ResolvedDocsConfig;
  /** Folders inside the Markdown folder that hold no pages, such as where the command copies the site. */
  readonly exclude?: readonly string[];
}

export default function elanorDocs(options: ElanorDocsOptions = {}): AstroIntegration {
  let config: ResolvedDocsConfig;
  let cacheDir: string;

  return {
    name: '@earendil-works/elanor-docs-kit',
    hooks: {
      'astro:config:setup': ({config: astroConfig, updateConfig, injectRoute, command}) => {
        const root = fileURLToPath(astroConfig.root);
        config = options.resolved ?? resolveConfig(root, options);
        cacheDir = fileURLToPath(astroConfig.cacheDir);

        const styles = [
          require.resolve(`@earendil-works/design-tokens/${config.brand}.css`),
          require.resolve('@earendil-works/elanor-react/elanor.min.css'),
          require.resolve('@earendil-works/elanor-fonts/mallos-serif.css'),
          require.resolve('@earendil-works/elanor-fonts/commit-mono.css'),
          ...(config.brand === 'lefos'
            ? [require.resolve('@earendil-works/elanor-fonts/departure-mono.css')]
            : []),
          join(runtime, 'styles/global.css'),
          join(runtime, 'styles/docs.css'),
          ...config.customCss,
        ];
        const components = componentSlots.map(
          (slot) =>
            `export {default as ${slot}} from ${JSON.stringify(config.components[slot] ?? join(runtime, `components/slots/${slot}.astro`))};`,
        );
        const runtimeConfig = {
          ...config,
          // The built site and Astro's files may sit inside the Markdown folder.
          exclude: [fileURLToPath(astroConfig.outDir), root, cacheDir, ...(options.exclude ?? [])],
          themeColor: themeColor(config.brand),
        };
        const modules: Record<string, string> = {
          [virtualIds.config]: `export default ${JSON.stringify(runtimeConfig)};`,
          [virtualIds.styles]: styles.map((path) => `import ${JSON.stringify(path)};`).join('\n'),
          [virtualIds.components]: components.join('\n'),
        };

        updateConfig({
          site: astroConfig.site ?? config.site,
          base: astroConfig.base === '/' ? config.base : astroConfig.base,
          trailingSlash: 'ignore',
          build: {format: 'directory'},
          integrations: [
            react(),
            pageScripts(
              {
                'navigation-behaviors': {
                  entry: join(runtime, 'scripts/navigation-behaviors.ts'),
                  type: 'classic',
                },
                'page-behaviors': {
                  entry: join(runtime, 'scripts/page-behaviors.ts'),
                  type: 'module',
                },
              },
              cacheDir,
            ),
          ],
          vite: {
            // A project's own components import Elanor and the kit's parts without installing them.
            resolve: {
              alias: [
                {
                  find: /^@earendil-works\/elanor-react$/,
                  replacement: require.resolve('@earendil-works/elanor-react'),
                },
                {
                  find: /^@earendil-works\/elanor-docs-kit\/components\//,
                  replacement: join(runtime, 'components/'),
                },
              ],
            },
            plugins: [
              {
                name: 'elanor-docs-kit:virtual-modules',
                resolveId(id) {
                  return id in modules ? `\0${id}` : undefined;
                },
                load(id) {
                  return id.startsWith('\0') ? modules[id.slice(1)] : undefined;
                },
              },
            ],
            // The routes and components are sources, for Vite to compile, and the prerendered
            // pages run from the output folder, where the kit's dependencies do not resolve: the
            // build bundles them.
            ssr: {noExternal: command === 'build' ? true : ['@earendil-works/elanor-docs-kit']},
            // The stylesheets' folders hold their fonts.
            server: {
              fs: {allow: [runtime, config.docsDir, ...styles.map((path) => dirname(path))]},
            },
          },
        });

        injectRoute({pattern: '/[...slug]', entrypoint: join(runtime, 'routes/page.astro')});
        injectRoute({
          pattern: '/search-index.json',
          entrypoint: join(runtime, 'routes/search-index.json.ts'),
        });
        injectRoute({pattern: '/llms.txt', entrypoint: join(runtime, 'routes/llms.txt.ts')});
        if (command === 'build') {
          injectRoute({pattern: '/404', entrypoint: join(runtime, 'routes/404.astro')});
        }
      },

      'astro:server:setup': ({server}) => {
        const base = server.config.base.endsWith('/')
          ? server.config.base
          : `${server.config.base}/`;
        // Changed Markdown reloads the open pages; the routes read the folder on each request.
        // Added and removed pages change the routes' paths, which Astro reads again when their
        // module changes.
        server.watcher.add(config.docsDir);
        const pageRoute = join(runtime, 'routes/page.astro');
        const inDocs = (path: string) => path.startsWith(config.docsDir + sep);
        server.watcher.on('change', (path) => {
          if (inDocs(path)) server.ws.send({type: 'full-reload'});
        });
        for (const event of ['add', 'unlink'] as const) {
          server.watcher.on(event, (path) => {
            if (inDocs(path)) server.watcher.emit('change', pageRoute);
          });
        }

        // The Markdown folder's own files, as the build copies them.
        server.middlewares.use((request, response, next) => {
          const pathname = decodeURIComponent(request.url?.split('?', 1)[0] ?? '');
          if (!pathname.startsWith(base)) return next();
          const path = resolve(config.docsDir, `.${sep}${pathname.slice(base.length)}`);
          const rel = relative(config.docsDir, path);
          if (rel.startsWith('..') || !isPublishedFile(rel)) return next();
          if (!existsSync(path) || !statSync(path).isFile()) return next();
          response.setHeader('Content-Type', contentTypes[extname(path).toLowerCase()]!);
          createReadStream(path).pipe(response);
        });
      },

      'astro:build:done': async ({dir, logger}) => {
        // The routes' warnings (`runtime/content/warnings.ts`).
        const problems = (globalThis as {[key: symbol]: Set<string> | undefined})[
          Symbol.for('@earendil-works/elanor-docs-kit/warnings')
        ];
        if (config.strict && problems?.size) {
          throw new Error(
            `The docs have ${problems.size} problem(s), and strict mode is on:\n${[...problems].map((problem) => `- ${problem}`).join('\n')}`,
          );
        }
        const outDir = fileURLToPath(dir);
        await cp(config.docsDir, outDir, {
          recursive: true,
          force: false,
          filter: (source) => {
            const rel = relative(config.docsDir, source);
            // The output may sit inside the Markdown folder.
            if (rel === '' || resolve(source) === resolve(outDir)) return rel === '';
            if (statSync(source).isDirectory()) return isPublishedFile(`${rel}/x.md`);
            return isPublishedFile(rel);
          },
        });
        logger.info(`Copied the files of ${config.docsDir}`);
      },
    },
  };
}

export {elanorDocs};
