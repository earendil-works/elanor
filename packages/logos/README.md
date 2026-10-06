# `@earendil-works/elanor-logos`

Earendil, Pi, Radius, and Lefos logos as SVG files, built from clean sources and the logo color tokens. React components live in [`@earendil-works/elanor-logos-react`](./react/README.md).

## Sources

`sources/<brand>/` holds each brand's `mark`, optional `mark-monochrome` (brands without one use their mark), `wordmark`, and `wordmark-small`, transferred from the Figma logo components. A source contains only paths; each fill links to a logo token, for example `fill="{semantic.color.logo.symbol.1}"`. The build replaces the links with color values, so outputs are plain SVGs.

[`config.ts`](./config.ts) defines the source parts, brands, color treatments, logo tokens, clear space, and lockup rules. Lockups are composed like the Figma auto layout, and each lockup rule adds a `logo-wordmark-<lockup>` asset kind. Paths are only moved into place, with exact decimal arithmetic, so geometry is unchanged.

## Exports

[`exports.config.ts`](./exports.config.ts) lists everything else the build produces as export plugins with their options: PNGs, CMYK print PDFs, favicons and web app icons, avatars, email-signature images, brand guidelines, and press kits. Each plugin lives in [`scripts/exports/`](./scripts/exports/) and receives a shared context with the composed assets, per-brand tokens, and the manifest. Plugins run in the listed order. To add a kind of output, add a plugin and list it in the config.

Each export writes to its own folder in `dist/`, such as `favicons/<brand>/` or `print/<brand>/<profile>/`. Press kits contain only the logos: each brand's `kits/<brand>/` folder (`logo/`, `logo-wordmark-horizontal/`, and `logo-wordmark-vertical/`, by color treatment) plus the kit's guidelines.

Brand guidelines are generated per press kit from [`guidelines/template.md`](./guidelines/template.md) and a short description of each brand in [`guidelines/brands/`](./guidelines/brands/). Product kits get their own guidelines; the Earendil kit gets a company document covering every brand. Each document comes with a clear-space illustration drawn from the built artwork and the grid in `config.ts`, so it stays current when logos or tokens change.

```sh
pnpm build   # svg/, manifest.json, artwork.json, every export (e.g. kits/<brand>/, favicons/<brand>/, press-kits/*.zip), and the lib/ tooling
pnpm check   # sources are clean and link to existing logo tokens
pnpm test
```

## Favicons for a website

`elanor-logos favicons` copies a brand's favicon set into a site's public folder and prints the `<head>` tags. In a workspace package, add `"@earendil-works/elanor-logos": "workspace:*"` to its dev dependencies and run it before each build:

```jsonc
"scripts": {
  "predev": "elanor-logos favicons pi --out public",
  "prebuild": "elanor-logos favicons pi --out public"
}
```

```html
<link rel="icon" href="/favicon.ico?v=0.1.0" sizes="32x32">
<link rel="icon" href="/favicon.svg?v=0.1.0" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=0.1.0">
<link rel="manifest" href="/site.webmanifest?v=0.1.0">
```

The command copies from this package's build, so build it first (`pnpm --filter @earendil-works/elanor-logos build`); before that, it exits with a message saying so. The copied files are build output, so ignore them in Git. Favicon URLs carry the package version, because browsers cache favicons for a long time; update the tags when the version changes. Use `--base /path/` for a site served below the domain root, and `--head <file>` to write the tags to a file instead of printing them. Frameworks that render `<head>` themselves can use the same functions from JavaScript:

```ts
import {copyFavicons, faviconHead} from "@earendil-works/elanor-logos";

await copyFavicons("pi", "public");
const tags = await faviconHead("pi", {base: "/"});
```
