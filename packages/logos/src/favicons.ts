import {copyFile, mkdir, readFile} from 'node:fs/promises';
import {basename, resolve} from 'node:path';

// Compiled to lib/; both lib/ and src/ sit next to the package's dist/ and package.json.
const packageDirectory = resolve(import.meta.dirname, '..');
const distDirectory = resolve(packageDirectory, 'dist');

/** File names of the favicons the `<head>` tags link to. */
export interface FaviconFiles {
  ico: string;
  /** Absent for brands without an SVG favicon, such as painted ones. */
  svg?: string;
  appleTouchIcon: string;
  webmanifest: string;
}

export interface FaviconOptions {
  /** URL path the site serves the favicon files from. Defaults to "/". */
  base?: string;
}

interface Manifest {
  brands: Array<{id: string; favicons?: Record<string, string>}>;
}

/** The package version. Favicon URLs carry it, so browsers fetch updated icons instead of their long-cached ones. */
export async function packageVersion(): Promise<string> {
  const {version} = JSON.parse(
    await readFile(resolve(packageDirectory, 'package.json'), 'utf8'),
  ) as {version: string};
  return version;
}

/** The `<head>` tags for a favicon set. */
export function faviconTags(
  files: FaviconFiles,
  version: string,
  {base = '/'}: FaviconOptions = {},
): string {
  const prefix = base.endsWith('/') ? base : `${base}/`;
  const url = (file: string) => `${prefix}${file}?v=${version}`;
  return [
    `<link rel="icon" href="${url(files.ico)}" sizes="32x32">`,
    ...(files.svg ? [`<link rel="icon" href="${url(files.svg)}" type="image/svg+xml">`] : []),
    `<link rel="apple-touch-icon" href="${url(files.appleTouchIcon)}">`,
    `<link rel="manifest" href="${url(files.webmanifest)}">`,
    '',
  ].join('\n');
}

/** A brand's built favicon files, by manifest key, as paths relative to dist/. */
async function brandFavicons(brand: string): Promise<Record<string, string>> {
  const manifest = JSON.parse(
    await readFile(resolve(distDirectory, 'manifest.json'), 'utf8'),
  ) as Manifest;
  const entry = manifest.brands.find(({id}) => id === brand);
  if (!entry)
    throw new Error(
      `Unknown brand "${brand}". Available brands: ${manifest.brands.map(({id}) => id).join(', ')}.`,
    );
  if (!entry.favicons) throw new Error(`${brand} has no favicons in this build.`);
  return entry.favicons;
}

function faviconFiles(favicons: Record<string, string>): FaviconFiles {
  const name = (key: keyof FaviconFiles) => {
    const path = favicons[key];
    if (!path) throw new Error(`The build has no ${key} favicon.`);
    return basename(path);
  };
  return {
    ico: name('ico'),
    ...(favicons.svg ? {svg: name('svg')} : {}),
    appleTouchIcon: name('appleTouchIcon'),
    webmanifest: name('webmanifest'),
  };
}

/** The `<head>` tags for a brand's favicons, served from `base`. */
export async function faviconHead(brand: string, options: FaviconOptions = {}): Promise<string> {
  return faviconTags(faviconFiles(await brandFavicons(brand)), await packageVersion(), options);
}

/**
 * Copies every favicon file a site serves for a brand into a directory, such as the site's public folder.
 * Returns the copied file names.
 */
export async function copyFavicons(brand: string, directory: string): Promise<string[]> {
  const favicons = await brandFavicons(brand);
  await mkdir(directory, {recursive: true});
  const copied: string[] = [];
  for (const [key, path] of Object.entries(favicons)) {
    // The head snippet documents the tags; sites do not serve it.
    if (key === 'html') continue;
    await copyFile(resolve(distDirectory, path), resolve(directory, basename(path)));
    copied.push(basename(path));
  }
  return copied;
}
