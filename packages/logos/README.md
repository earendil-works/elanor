# `@earendil-works/elanor-logos`

Earendil, Pi, Radius, Lefos, and Elanor logos as SVG files, plus PNGs, print PDFs, favicons, and press kits. Elanor's painted flower has only color logos as SVG and PNG, profile pictures, and favicons. For React, use [`@earendil-works/elanor-logos-react`](./react/README.md).

## Use

Every file in `dist/` is exported by path. Build the package first.

```ts
import logoUrl from '@earendil-works/elanor-logos/svg/radius/radius-logo-on-light.svg';
```

SVG names follow `<brand>-logo[-wordmark-<horizontal|vertical>][-monochrome]-on-<light|dark>.svg`. Before placing a logo, read the brand guidelines in `dist/guidelines/<brand>/BRAND-GUIDELINES.md`.

## Website favicons

`elanor-logos favicons` copies a brand's favicon set into your public folder and prints the `<head>` tags. It copies from this package's `dist/`, so build this package first:

```sh
pnpm --filter @earendil-works/elanor-logos build
```

Then add `"@earendil-works/elanor-logos": "workspace:*"` to your app's dev dependencies and copy favicons before each build:

```jsonc
"scripts": {
  "predev": "elanor-logos favicons pi --out public",
  "prebuild": "elanor-logos favicons pi --out public"
}
```

Paste the printed tags into your `<head>`. The URLs include the package version so browsers fetch new favicons; paste the new tags when the version changes. Ignore the copied files in Git.

```html
<link rel="icon" href="/favicon.ico?v=0.1.0" sizes="32x32" />
<link rel="icon" href="/favicon.svg?v=0.1.0" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=0.1.0" />
<link rel="manifest" href="/site.webmanifest?v=0.1.0" />
```

Use `--base /path/` for subdirectory hosting and `--head <file>` to save the tags. The JavaScript API provides the same operations:

```ts
import {copyFavicons, faviconHead} from '@earendil-works/elanor-logos';

await copyFavicons('pi', 'public');
const tags = await faviconHead('pi', {base: '/'});
```

## Develop

```sh
pnpm build   # dist/ artwork and exports, plus lib/ (CLI and favicon API)
pnpm check   # source geometry and token references
pnpm test
```

- `sources/<brand>/`: path-only SVGs from Figma: `mark`, optional `mark-monochrome`, `wordmark`, and `wordmark-small`. Fills reference tokens, e.g. `fill="{semantic.color.logo.symbol.1}"`. A traced painting (`painting: true` in the config, such as Elanor's flower) keeps fixed `#rrggbb` fills in its `mark`.
- [`config.ts`](./config.ts): brands, colors, clear space, and lockups. The build resolves colors and positions paths without changing their geometry.
- [`exports.config.ts`](./exports.config.ts): ordered [plugins](./scripts/exports/) for PNGs, CMYK PDFs, favicons, avatars, email signatures, guidelines, and press kits. Each receives the assets, brand tokens, and manifest.

Press kits contain each brand's `logo/`, `logo-wordmark-horizontal/`, and `logo-wordmark-vertical/` folders, grouped by color treatment, plus guidelines.

Guidelines combine the [template](./guidelines/template.md), [brand descriptions](./guidelines/brands/), and generated clear-space illustrations. Product kits cover one brand; the Earendil kit covers all brands. `guidelines/<kit>.json` exposes the title, intro, and sections as Markdown, HTML, and images for the docs and API.
