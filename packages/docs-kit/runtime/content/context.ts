import {existsSync, statSync} from 'node:fs';
import {join} from 'node:path';

import config from 'virtual:elanor-docs/config';

import type {DocsLink} from '../../src/config.ts';
import type {RenderOptions} from './markdown.ts';
import {loadSite, type Site} from './site.ts';

/*
 * What the routes share: the configuration the integration resolved, and the site read from the
 * Markdown folder with it.
 */

/** The resolved configuration, with what the integration adds for the pages. */
export interface RuntimeConfig {
  readonly docsDir: string;
  readonly name: string;
  readonly description: string | undefined;
  readonly brand: 'earendil' | 'pi' | 'radius' | 'lefos' | 'elanor';
  readonly site: string | undefined;
  readonly base: string;
  readonly repository: string | undefined;
  readonly editUrl: string | undefined;
  readonly lastUpdated: boolean;
  readonly links: readonly DocsLink[];
  /** Folders inside the Markdown folder that hold no pages, such as the built site. */
  readonly exclude: readonly string[];
  /** The canvas color, for the browser's theme color. */
  readonly themeColor: {readonly light: string; readonly dark: string} | undefined;
}

export {config};

export function getSite(): Site {
  return loadSite({
    docsDir: config.docsDir,
    base: config.base,
    lastUpdated: config.lastUpdated,
    exclude: config.exclude,
  });
}

export const renderOptions: RenderOptions = {
  base: config.base,
  sourceUrl: config.editUrl?.replace('/edit/', '/blob/'),
  fileExists: (file) => {
    const path = join(config.docsDir, file);
    return existsSync(path) && statSync(path).isFile();
  },
};

/** An absolute address of the site, when it knows where it is published. */
export function absoluteUrl(path: string): string {
  return config.site ? new URL(path, config.site).href : path;
}
