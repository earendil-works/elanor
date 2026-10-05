import {readdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {dirname, relative, resolve} from 'node:path';

// Resolve from the docs package itself; bundled pages move away from their sources.
const require = createRequire(resolve(process.cwd(), 'package.json'));

export const logosDist = dirname(require.resolve('@earendil-works/elanor-logos/manifest.json'));
/** The company brand guidelines and their clear-space image. */
export const logosGuidelines = resolve(logosDist, 'guidelines/earendil');
export const iconsDist = dirname(require.resolve('@earendil-works/elanor-icons/metadata.json'));

export interface LogoAsset {
  id: string;
  kind: 'logo' | 'logo-wordmark-horizontal' | 'logo-wordmark-stacked';
  treatment: 'on-light' | 'on-dark' | 'monochrome-on-light' | 'monochrome-on-dark';
  scheme: 'light' | 'dark';
  monochrome: boolean;
  width: number;
  height: number;
  files: {svg: string; png?: string; pdf?: Record<string, string>; [key: string]: unknown};
}

export interface LogoBrand {
  id: string;
  name: string;
  backgrounds: Record<'light' | 'dark', string>;
  assets: LogoAsset[];
  favicons?: Record<string, string>;
  avatars?: Array<{treatment: string; size: number; path: string}>;
}

export interface LogoManifest {
  gridUnit: number;
  clearSpace: number;
  brands: LogoBrand[];
  pressKits?: Record<string, string>;
}

export interface IconEntry {
  tags: string[];
}

/** Every file below a directory, as paths relative to it. */
export async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, {recursive: true, withFileTypes: true});
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => relative(directory, resolve(entry.parentPath, entry.name)))
    .sort();
}
