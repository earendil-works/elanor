import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

import type {AstroIntegration} from 'astro';
import {build, type BuildOptions, type OutputFile} from 'esbuild';

/*
 * Bundles the scripts of the docs' static components with esbuild, outside Vite, like Elanor's own
 * docs (`apps/docs/plugins/page-scripts.ts`): Vite only bundles Astro's scripts as deferred
 * modules, and the navigation's script must run while the page is parsed. Serves each at
 * `<base>_scripts/<name>.js`; the dev server bundles on request, the build writes the files.
 */

/** The scripts' folder under the site's base. */
export const pageScriptsDir = '_scripts/';

export interface PageScript {
  /** The entry module's path. */
  readonly entry: string;
  /**
   * `classic` for a script that runs while the page is parsed, before the first paint; `module`
   * for a deferred module script, whose dynamic imports load as separate chunks.
   */
  readonly type: 'classic' | 'module';
}

export function pageScripts(
  scripts: Readonly<Record<string, PageScript>>,
  cacheDir: string,
): AstroIntegration {
  let base = '/';

  const options = (script: PageScript, outdir: string, development: boolean): BuildOptions => ({
    entryPoints: [script.entry],
    outdir,
    entryNames: '[dir]/[name]',
    chunkNames: 'chunks/[name]-[hash]',
    bundle: true,
    splitting: script.type === 'module',
    format: script.type === 'module' ? 'esm' : 'iife',
    target: 'es2022',
    minify: !development,
    // Component styles reach the page through its stylesheets, not these scripts.
    loader: {'.css': 'empty'},
    logLevel: 'warning',
    // Elanor's barrels import their parts' entry points bare; those have no side effects.
    logOverride: {'ignored-bare-import': 'silent'},
    write: false,
  });

  /** Each output by its path under the scripts' folder. */
  async function bundle(name: string, outdir: string, development: boolean) {
    const script = scripts[name]!;
    const result = await build(options(script, outdir, development));
    const files = new Map<string, OutputFile>();
    for (const file of result.outputFiles ?? []) {
      const path = relative(outdir, file.path);
      // The entry, named after the script rather than its module.
      files.set(path.startsWith('chunks/') ? path : `${name}.js`, file);
    }
    return files;
  }

  return {
    name: 'elanor-docs-kit:page-scripts',
    hooks: {
      'astro:config:done': ({config}) => {
        base = config.base.endsWith('/') ? config.base : `${config.base}/`;
      },
      'astro:server:setup': ({server}) => {
        const outdir = `${cacheDir}/page-scripts/`;
        // The chunks of the last bundled module scripts.
        const chunks = new Map<string, OutputFile>();
        server.middlewares.use(async (request, response, next) => {
          const pathname = request.url?.split('?', 1)[0] ?? '';
          const prefix = `${base}${pageScriptsDir}`;
          if (!pathname.startsWith(prefix)) {
            next();
            return;
          }
          const path = pathname.slice(prefix.length);
          const name = path.replace(/\.js$/, '');
          try {
            let file = chunks.get(path);
            if (scripts[name]) {
              for (const [output, outputFile] of await bundle(name, outdir, true)) {
                if (output.startsWith('chunks/')) chunks.set(output, outputFile);
                else file = outputFile;
              }
            }
            if (!file) {
              next();
              return;
            }
            response.setHeader('Content-Type', 'text/javascript; charset=utf-8');
            response.setHeader('Cache-Control', 'no-store');
            response.end(file.text);
          } catch (error) {
            next(error);
          }
        });
      },
      'astro:build:done': async ({dir}) => {
        const outdir = fileURLToPath(new URL(pageScriptsDir, dir));
        for (const name of Object.keys(scripts)) {
          for (const [path, file] of await bundle(name, outdir, false)) {
            const target = `${outdir}${path}`;
            await mkdir(dirname(target), {recursive: true});
            await writeFile(target, file.contents);
          }
        }
      },
    },
  };
}
