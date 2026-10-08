import {readdir, readFile} from 'node:fs/promises';
import {relative, resolve} from 'node:path';

import type {BrandId} from '../../config.js';
import {createZip} from '../lib/containers.js';
import type {ExportPlugin} from './plugin.js';

export interface PressKitsOptions {
  /** Press kits by name, each with the brands whose kit folders it bundles. */
  kits: Record<string, BrandId[]>;
  /** Directories in the output directory whose files go at the root of each kit; `{kit}` is replaced by the kit name. */
  include: string[];
}

/** Zip archives of the brand kit folders (`kits/<brand>/`). Runs after the plugins that fill those folders. */
export function pressKits(options: PressKitsOptions): ExportPlugin {
  return {
    name: 'press-kits',
    async run(context) {
      const {distDirectory} = context;
      const kits: Record<string, string> = {};
      for (const [kit, kitBrands] of Object.entries(options.kits)) {
        const root = `${kit}-press-kit`;
        const files: Array<{path: string; data: Buffer}> = [];
        for (const pattern of options.include) {
          const directory = resolve(distDirectory, pattern.replaceAll('{kit}', kit));
          for (const file of await listFiles(directory)) {
            files.push({path: `${root}/${relative(directory, file)}`, data: await readFile(file)});
          }
        }
        for (const brand of kitBrands) {
          const directory = resolve(distDirectory, 'kits', brand);
          for (const file of await listFiles(directory)) {
            files.push({
              path: `${root}/${brand}/${relative(directory, file)}`,
              data: await readFile(file),
            });
          }
        }
        kits[kit] = await context.write(`press-kits/${root}.zip`, createZip(files));
      }
      context.manifest.pressKits = kits;
    },
  };
}

async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, {withFileTypes: true});
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? listFiles(resolve(directory, entry.name))
        : [resolve(directory, entry.name)],
    ),
  );
  return nested.flat().sort();
}
