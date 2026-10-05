import {type BrandId, brands} from "../../config.js";
import {createIco} from "../lib/containers.js";
import {circleSafeFrame, frameSvg, renderPng, squareFrame} from "../lib/raster.js";
import type {ExportPlugin} from "./plugin.js";

export interface FaviconsOptions {
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
    name: "favicons",
    kitContents: "`favicons/` for websites and apps",
    async run(context) {
      for (const brand of Object.keys(brands) as BrandId[]) {
        const light = context.mark(brand, "on-light").colored;
        const dark = context.mark(brand, "on-dark").colored;
        const directory = `kits/${brand}/favicons`;
        const files: Record<string, string> = {};
        const background = await context.background(brand, "light");

        // The SVG favicon switches to the dark colors with the browser's color scheme:
        // paths whose color changes get a class named after their dark color.
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
        const rules = [...darkFills].map((fill) => `.${classFor(fill)}{fill:${fill}}`).join("");
        const svgFrame = squareFrame(light, options.svgSize, 0);
        files.svg = await context.write(
          `${directory}/favicon.svg`,
          frameSvg(themed, rules ? {...svgFrame, style: `@media (prefers-color-scheme:dark){${rules}}`} : svgFrame),
        );

        const icoImages = [];
        for (const size of options.icoSizes) icoImages.push({size, png: await renderPng(light, squareFrame(light, size, 0))});
        files.ico = await context.write(`${directory}/favicon.ico`, createIco(icoImages));
        files.appleTouchIcon = await context.write(
          `${directory}/apple-touch-icon.png`,
          await renderPng(light, squareFrame(light, options.appleTouchSize, options.padding, background)),
        );
        const icons = [];
        for (const size of options.iconSizes) {
          const path = await context.write(`${directory}/icon-${size}.png`, await renderPng(light, squareFrame(light, size, options.padding)));
          icons.push({src: `icon-${size}.png`, sizes: `${size}x${size}`, type: "image/png"});
          files[`icon${size}`] = path;
        }
        files.maskable = await context.write(
          `${directory}/icon-maskable-${options.maskableSize}.png`,
          await renderPng(light, circleSafeFrame(light, options.maskableSize, options.safeZone, background)),
        );
        icons.push({src: `icon-maskable-${options.maskableSize}.png`, sizes: `${options.maskableSize}x${options.maskableSize}`, type: "image/png", purpose: "maskable"});

        const name = brands[brand].name;
        files.webmanifest = await context.write(
          `${directory}/site.webmanifest`,
          `${JSON.stringify({name, short_name: name, icons, theme_color: background, background_color: background, display: "standalone"}, null, 2)}\n`,
        );
        files.html = await context.write(
          `${directory}/head.html`,
          [
            '<link rel="icon" href="/favicon.ico" sizes="32x32">',
            '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
            '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
            '<link rel="manifest" href="/site.webmanifest">',
            "",
          ].join("\n"),
        );
        context.brandManifest(brand).favicons = files;
      }
    },
  };
}

function classFor(fill: string): string {
  return `c${fill.slice(1)}`;
}
