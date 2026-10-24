import {basename} from 'node:path';

import {type BrandId, brands} from '../../config.js';
import {faviconTags, packageVersion} from '../../src/favicons.js';
import type {ColoredArtwork} from '../lib/compose.js';
import {createIco} from '../lib/containers.js';
import {circleSafeFrame, frameSvg, renderPng, squareFrame} from '../lib/raster.js';
import type {ExportPlugin, TreatmentId} from './plugin.js';

export interface FaviconsOptions {
  /**
   * The symbol treatments for light and dark color schemes. Raster icons use
   * the light one; the SVG favicon switches to the dark one's colors.
   * Defaults to the color symbols.
   */
  treatments?: {light: TreatmentId; dark: TreatmentId};
  /** Per-brand overrides, e.g. for a painted mark; `svg: false` skips the SVG favicon. */
  brands?: Partial<
    Record<BrandId, {treatments?: {light: TreatmentId; dark: TreatmentId}; svg?: false}>
  >;
  /** Pixel size of the SVG favicon. */
  svgSize: number;
  icoSizes: number[];
  appleTouchSize: number;
  iconSizes: number[];
  maskableSize: number;
  /** Space in source units around the touch and app icons. */
  padding: number;
  /** The maskable icon's artwork fits a central circle of this share of the width. */
  safeZone: number;
}

/** Favicon, touch icon, PWA icons, web manifest, and an HTML snippet per brand. */
export function favicons(options: FaviconsOptions): ExportPlugin {
  return {
    name: 'favicons',
    async run(context) {
      // Favicon URLs carry the package version, so browsers fetch updated icons.
      const version = await packageVersion();
      for (const brand of Object.keys(brands) as BrandId[]) {
        const brandOptions = options.brands?.[brand];
        const treatments = brandOptions?.treatments ??
          options.treatments ?? {light: 'on-light', dark: 'on-dark'};
        const light = context.mark(brand, treatments.light).colored;
        const dark = context.mark(brand, treatments.dark).colored;
        const directory = `favicons/${brand}`;
        const files: Record<string, string> = {};
        const background = await context.background(brand, 'light');
        if (brandOptions?.svg !== false)
          files.svg = await context.write(
            `${directory}/favicon.svg`,
            svgFavicon(
              light,
              dark,
              options.svgSize,
              `${brand}: the ${treatments.light} and ${treatments.dark} symbols`,
            ),
          );

        const icoImages = [];
        for (const size of options.icoSizes)
          icoImages.push({size, png: await renderPng(light, squareFrame(light, size, 0))});
        files.ico = await context.write(`${directory}/favicon.ico`, createIco(icoImages));
        files.appleTouchIcon = await context.write(
          `${directory}/apple-touch-icon.png`,
          await renderPng(
            light,
            squareFrame(light, options.appleTouchSize, options.padding, background),
          ),
        );
        const icons = [];
        for (const size of options.iconSizes) {
          const path = await context.write(
            `${directory}/icon-${size}.png`,
            await renderPng(light, squareFrame(light, size, options.padding)),
          );
          icons.push({
            src: `icon-${size}.png?v=${version}`,
            sizes: `${size}x${size}`,
            type: 'image/png',
          });
          files[`icon${size}`] = path;
        }
        files.maskable = await context.write(
          `${directory}/icon-maskable-${options.maskableSize}.png`,
          await renderPng(
            light,
            circleSafeFrame(light, options.maskableSize, options.safeZone, background),
          ),
        );
        icons.push({
          src: `icon-maskable-${options.maskableSize}.png?v=${version}`,
          sizes: `${options.maskableSize}x${options.maskableSize}`,
          type: 'image/png',
          purpose: 'maskable',
        });

        const name = brands[brand].name;
        files.webmanifest = await context.write(
          `${directory}/site.webmanifest`,
          `${JSON.stringify({name, short_name: name, icons, theme_color: background, background_color: background, display: 'standalone'}, null, 2)}\n`,
        );
        files.html = await context.write(
          `${directory}/head.html`,
          faviconTags(
            {
              ico: basename(files.ico),
              ...(files.svg ? {svg: basename(files.svg)} : {}),
              appleTouchIcon: basename(files.appleTouchIcon),
              webmanifest: basename(files.webmanifest),
            },
            version,
          ),
        );
        context.brandManifest(brand).favicons = files;
      }
    },
  };
}

/** An SVG favicon that switches to the dark symbol's colors with the browser's color scheme. */
function svgFavicon(
  light: ColoredArtwork,
  dark: ColoredArtwork,
  size: number,
  label: string,
): string {
  if (light.paths.length !== dark.paths.length)
    throw new Error(`${label} must share their paths for the SVG favicon`);
  // Paths whose color changes get a class named after their dark color.
  const darkFills = new Set<string>();
  const themed = {
    ...light,
    paths: light.paths.map((path, index) => {
      const darkFill = dark.paths[index]!.fill;
      if (darkFill === path.fill) return path;
      darkFills.add(darkFill);
      return {...path, className: classFor(darkFill)};
    }),
  };
  const rules = [...darkFills].map((fill) => `.${classFor(fill)}{fill:${fill}}`).join('');
  const frame = squareFrame(light, size, 0);
  return frameSvg(
    themed,
    rules ? {...frame, style: `@media (prefers-color-scheme:dark){${rules}}`} : frame,
  );
}

function classFor(fill: string): string {
  return `c${fill.slice(1)}`;
}
