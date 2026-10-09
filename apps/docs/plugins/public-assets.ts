import {readFile, readdir, rm, writeFile} from 'node:fs/promises';
import {join, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

import type {AstroIntegration} from 'astro';
import type {Manifest} from 'vite';

/** Publish only the dependency closure of the guest pages, never all of /_astro/. */
export function publicAssets(): AstroIntegration {
  return {
    name: 'elanor-public-assets',
    hooks: {
      'astro:build:setup': ({vite}) => {
        const client = vite.environments?.client;
        if (!client) throw new Error('Public assets require the Astro client build environment');
        // Astro removes .vite after each environment; use a temporary manifest outside it.
        client.build = {...client.build, manifest: 'public-build-manifest.json'};
      },
      'astro:build:done': async ({dir}) => {
        const root = fileURLToPath(dir);
        const manifest = JSON.parse(
          await readFile(join(root, 'public-build-manifest.json'), 'utf8'),
        ) as Manifest;
        await rm(join(root, 'public-build-manifest.json'));
        const chunks = new Map(Object.values(manifest).map((chunk) => [chunk.file, chunk]));
        const paths = new Set<string>();

        async function include(file: string): Promise<void> {
          const path = `/${file}`;
          if (paths.has(path)) return;
          if (!file.startsWith('_astro/')) {
            throw new Error(`Unexpected public page dependency: ${file}`);
          }
          paths.add(path);
          // Reading every dependency also makes missing build outputs fail closed.
          const source = await readFile(join(root, file));
          const chunk = chunks.get(file);
          if (chunk) {
            for (const dependency of [...(chunk.imports ?? []), ...(chunk.dynamicImports ?? [])]) {
              const imported = manifest[dependency];
              if (!imported) throw new Error(`Missing public dependency: ${dependency}`);
              await include(imported.file);
            }
            for (const asset of [...(chunk.css ?? []), ...(chunk.assets ?? [])]) {
              await include(asset);
            }
          }
          if (file.endsWith('.css')) {
            for (const match of source.toString().matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g)) {
              const url = new URL(match[1]!, `https://assets.local/${file}`);
              if (url.origin === 'https://assets.local') await include(url.pathname.slice(1));
            }
          }
        }

        for (const page of ['guest/index.html', 'guest/brand/index.html']) {
          const html = await readFile(join(root, page), 'utf8');
          for (const match of html.matchAll(/\/_astro\/[a-zA-Z0-9_.-]+/g)) {
            await include(match[0].slice(1));
          }
        }
        // The entire logo API (including guidelines, images, and ZIP/PDF downloads) is public.
        const files = await readdir(join(root, 'api/logos'), {
          recursive: true,
          withFileTypes: true,
        });
        for (const file of files) {
          if (!file.isFile()) continue;
          const path = `/${relative(root, join(file.parentPath, file.name)).replaceAll('\\', '/')}`;
          paths.add(path);
          // Match Wrangler's auto-trailing-slash HTML handling: redirects must stay public.
          if (path.endsWith('/index.html')) paths.add(path.slice(0, -'index.html'.length));
          else if (path.endsWith('.html')) paths.add(path.slice(0, -'.html'.length));
        }
        await readFile(join(root, 'brand/llms.txt'));
        paths.add('/brand/llms.txt');
        await writeFile(join(root, 'public-assets.txt'), [...paths].sort().join('\n') + '\n');
      },
    },
  };
}
